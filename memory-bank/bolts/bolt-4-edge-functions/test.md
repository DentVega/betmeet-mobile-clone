# Bolt 4 — Stage 5: Test

> Edge Functions aren't deployed by us (user runs `functions deploy`). Verification: pure scoring unit tests (Deno) + applying the write-functions migration over Bolt 3 on an **ephemeral Postgres 17** and exercising every plpgsql function with a simulated `auth.uid()` (GUC).

## Scoring unit tests (Deno) — authored
`supabase/functions/_shared/scoring.test.ts`: EXACT(5), RESULT(2 + per-team goal), PARTIAL(1), MISS(0), penalty bonus on knockout draw, no bonus in group stage, no bonus on wrong shootout side. **Not executed here (Deno not installed)** — runs on `deno test` in CI/deploy. Logic is a verbatim port of the blueprint constants/algorithm.

## plpgsql functions — applied + exercised on ephemeral PG17
Stubs: roles + `auth.users` + `auth.uid()` reading a `app.uid` GUC. Applied all 6 migrations (Bolt 3 + Bolt 4) cleanly, then:
```
create_pool: OK
dup_name: OK (NAME_TAKEN)                 ← public-name uniqueness enforced
save_pred editable: ok=true
u2_join: OK
u3_join: OK (FULL)                         ← capacity (2) enforced; owner counts
u2_rejoin: alreadyMember=true              ← idempotent join
save_after_kickoff: ok=false code=LOCKED   ← eligibility lock
locked_at set = true                       ← lock persists (return, not raise)
lock_guard: OK (rejected direct change)    ← trigger immutability on locked row
```
All expected behaviors confirmed.

## Bug found + fixed during Test
`fn_save_prediction` initially did `update … set locked_at=now(); raise exception 'LOCKED'` — but **`raise` rolls back the whole function transaction**, so the lock never persisted (and the lock-guard then saw an unlocked row). Fixed by **returning `{ok:false, code:'LOCKED'}`** instead of raising, so the lock side-effect commits. Re-validated → green.

## Not covered here (needs the deployed project)
- Live `functions.invoke` with a real user JWT (auth.uid via real claims) — after `supabase functions deploy`.
- `compute-score` end-to-end (admin secret + real match/predictions) — after deploy + a seeded finished match (Bolt 5).

## User action (deploy)
`supabase functions deploy save-prediction create-pool join-pool compute-score` and `supabase secrets set ADMIN_SECRET=<value>`. (`db push` first for the write-functions migration.)
