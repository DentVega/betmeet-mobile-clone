# Bolt V3 — Results & Auto-scoring — Outcome

- **Status:** ✅ Complete (validated on ephemeral PG17). Backend-only.
- **Intent:** 002-v2-web-parity · unit `results-autoscoring` · Stories US-RS1…RS4
- **DDD:** Model → Design+ADR-018 → Implement → Test (checkpoints approved)

## What shipped
- **Migration `20260701130000_auto_scoring.sql`**:
  - `fn_score_match(match_id)` — scoring ported to plpgsql verbatim (EXACT 5; RESULT 2 + exact-goals; KO-draw penalty +1); idempotent upsert; clears scores when not FINISHED.
  - trigger `score_match AFTER INSERT OR UPDATE OF status,home_score,away_score,winner_team_id ON matches` → auto-scores. **Replaces the manual `compute-score` step.**
  - added `matches` + `prediction_scores` to the `supabase_realtime` publication (no-op offline) → consumed by V4.
- **`enter-result` Edge Function** (guarded `x-admin-secret`): set a result (FINISHED + scores, auto-derives winner for decisive scores; operator passes it for KO draws) or `revert`. The trigger does the scoring.
- `compute-score` retained as a manual fallback (now optional).

## ADR
ADR-018 — in-DB plpgsql scoring via trigger (chosen over pg_net→Edge Function): atomic, offline-testable, no secret in DB.

## Verification
Trigger + rules validated on ephemeral PG (EXACT/RESULT/PARTIAL-MISS/KO-penalty, edit re-score, revert clear — all correct). No client code touched.

## Deferred / carried forward
- **Notification outbox emission** (FR-RS4 events) → V10: `fn_score_match`/trigger is the emission point; extended when `notification_events` exists.
- In-app result-entry UI (optional) — the guarded function is the surface for now.

## Activation
`supabase db push` (migration + realtime publication) + `supabase functions deploy enter-result`.

## Next
Bolt V4 — Realtime & Live (subscribe to the publication; live status + leaderboard projection).
