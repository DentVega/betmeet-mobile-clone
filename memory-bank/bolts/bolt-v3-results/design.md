# Bolt V3 — Stage 2: Design + ADR-018 (Results & Auto-scoring)

## ADR-018 — In-DB plpgsql scoring via trigger (not pg_net→Edge)
- **Decision:** port the scoring rules to a plpgsql `fn_score_match(match_id)` and drive it from an `AFTER INSERT OR UPDATE` trigger on `matches`. Result entry/revert via a guarded `enter-result` Edge Function that only writes the match row.
- **Alternatives:** trigger → `pg_net` HTTP → existing Deno `compute-score` (rejected — adds pg_net + service URL/secret stored in DB, async/no-transaction, harder to test). Keep `compute-score` as a manual fallback.
- **Consequences:** scoring is atomic within the result write, testable offline on ephemeral PG, no external dependency. Scoring logic now exists in two places (Deno + plpgsql) — both ported from the same verbatim rules; the plpgsql one is authoritative.

## Files
- **Migration `20260701130000_auto_scoring.sql`**:
  - `fn_score_match(p_match_id uuid) returns integer` (SECURITY DEFINER) — rules verbatim: EXACT=5; else RESULT(2 on matching goal-diff sign)+home-exact(1)+away-exact(1), case RESULT/PARTIAL/MISS; KO draw + penalty-winner match → +1. Upsert on `prediction_id`; delete-and-return-0 when not FINISHED / null scores.
  - `trg_score_match()` trigger fn → `perform fn_score_match(NEW.id)`.
  - trigger `score_match AFTER INSERT OR UPDATE OF status, home_score, away_score, winner_team_id ON matches`.
  - add `matches` + `prediction_scores` to `supabase_realtime` publication (DO block, swallow duplicate/undefined so it's a no-op on ephemeral PG / when already present).
- **`supabase/functions/enter-result/index.ts`** (guarded `x-admin-secret`, `verify_jwt=false`):
  - body `{ matchId, homeScore, awayScore, winnerTeamId?, revert? }`.
  - `revert:true` → `update matches set status='SCHEDULED', home_score=null, away_score=null, winner_team_id=null` → trigger clears scores → `{ok:true,reverted:true}`.
  - else require scores; fetch match team ids; `winner = winnerTeamId ?? (home>away?home_team_id : home<away?away_team_id : null)`; `update matches set status='FINISHED', scores, winner_team_id` → trigger scores → `{ok:true}`.
  - reuse `_shared/respond.ts` (cors/json) + `_shared/clients.ts` (adminClient).

## Test (ephemeral PG17)
- Seed a scheduled match + N predictions (EXACT / RESULT / PARTIAL / MISS / KO-penalty). `update` match → FINISHED+scores → assert `prediction_scores` rows + `total_points` per case (5 / 2+goals / 1 / 0 / +1 bonus). Edit the score → re-scores. Revert → rows deleted. Confirms trigger + rules + idempotency.
- tsc/jest unchanged (no client code).

## Activation
`supabase db push` (migration) + `supabase functions deploy enter-result`. Realtime publication applies on push.
