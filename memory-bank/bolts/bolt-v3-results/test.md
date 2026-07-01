# Bolt V3 — Test (Results & Auto-scoring)

## Backend (ephemeral PG17) — 12 migrations, trigger + rules
Reassigned a group match to the KNOCKOUT phase to exercise the penalty branch; inserted predictions; drove the trigger via `UPDATE matches ... FINISHED`.

| Scenario | Expected | Got |
|---|---|---|
| GROUP exact (pred 2-1, actual 2-1) | EXACT 5 | ✅ 5 |
| GROUP result (pred 2-0, actual 2-1) | RESULT 3 (result 2 + home-exact 1) | ✅ 3 |
| KO draw 1-1, pred 1-1 + correct penalty winner | EXACT 5 + penalty 1 = 6 | ✅ 6 (penalty_applied=t) |
| KO draw 1-1, pred 0-0 + wrong penalty winner | RESULT 2, no bonus | ✅ 2 (penalty_applied=f) |
| Edit result to 3-3 (re-score) | both MISS 0 | ✅ 0 / 0 (idempotent upsert) |
| Revert (status→SCHEDULED, null scores) | 0 rows | ✅ 0 |

Confirms: trigger fires on FINISHED, re-scores on edit, clears on revert; rules match `_shared/scoring.ts` verbatim; upsert idempotent.

## Static
- No client code changed (migration + Deno function only) — `tsc`/`jest` unaffected (54/54); `supabase/` excluded from both.
- `enter-result` mirrors the `compute-score` guard/shape (`x-admin-secret`, `respond.ts`).

## Not covered (needs live remote)
- `enter-result` invoked against deployed Supabase (needs `functions deploy` + `db push`).
- Realtime publication effect (verified only that the migration is a no-op offline; real effect is on hosted Supabase, consumed by V4).
