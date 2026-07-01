# Bolt V3 — Stage 1: Model (Results & Auto-scoring)

> Intent 002 · unit `results-autoscoring`. Backend-only. Traces to US-RS1…RS4 / FR-RS1…RS4. Replaces v1's manual `compute-score` invocation with an automatic in-DB sweeper.

## Problem
Today scoring lives ONLY in Deno (`_shared/scoring.ts` + `compute-score` invoked manually with `x-admin-secret`). Nothing scores automatically when a match finishes, so the leaderboard only updates if a human calls `compute-score`. There is no in-app/guarded way to enter a result either (seed-only).

## Ubiquitous language
- **Result entry** — setting a match's `home_score/away_score/(winner_team_id)` + `status=FINISHED` (guarded operation, not a normal user).
- **Auto-scoring sweeper** — a DB trigger that, whenever a match's result changes, (re)computes `prediction_scores` for that match automatically. **Idempotent** (upsert on `prediction_id`); clears scores if the match is no longer FINISHED.
- **Revert** — putting a match back to non-finished / null scores; the sweeper then deletes its `prediction_scores`.
- **Scoring rule (unchanged, ported to plpgsql verbatim)** — EXACT = 5; else RESULT(2 if outcome sign matches) + exact home-goal(1) + exact away-goal(1); KNOCKOUT draw + correct penalty winner → +1 bonus.

## Approach
1. **Port scoring to plpgsql** — `fn_score_match(match_id)` computes/upserts `prediction_scores` for a match using the exact rules; if not FINISHED or scores null → delete that match's scores. In-DB, atomic, testable on ephemeral PG (no external HTTP, no secret in DB → chosen over pg_net→Edge Function).
2. **Trigger** — `AFTER INSERT OR UPDATE OF status, home_score, away_score, winner_team_id ON matches` → `PERFORM fn_score_match(NEW.id)`. No recursion (only writes `prediction_scores`).
3. **`enter-result` Edge Function** (guarded `x-admin-secret`, like `compute-score`) — set a result (FINISHED + scores, auto-deriving `winner_team_id` for decisive scores; operator passes it for knockout draws) or **revert**. The trigger does the scoring; the function just writes the match.
4. **Realtime (FR-RS4)** — add `matches` + `prediction_scores` to the `supabase_realtime` publication so V4 can subscribe. **Notification events** (outbox) are deferred to V10 (the `notification_events` table doesn't exist yet) — the sweeper is the natural emission point and will be extended then.

## Invariants
- Scoring is authoritative + server-side; the sweeper is the single writer of `prediction_scores`.
- Idempotent: re-entering/editing a result re-scores deterministically; reverting clears cleanly.
- `compute-score` (Deno) stays as a manual fallback but is no longer required.
- Result entry stays guarded (admin secret) — not a normal-user capability.

## Out of model
An in-app admin UI for result entry (optional, later); notification outbox emission (V10); live football-data sync (deferred).
