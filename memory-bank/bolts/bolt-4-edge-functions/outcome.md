# Bolt 4 — Backend: Edge Functions — Outcome

- **Status:** ✅ Complete (code authored + validated locally; **user runs `db push` + `functions deploy`** to activate)
- **Intent:** 001-mobile-v1-migration · Phase B
- **DDD stages:** Model → Design → ADR-010 → Implement → Test (checkpoints approved)
- **FRs:** FR-BK3 (save-prediction), FR-BK4 (pools create/join), FR-BK5 (scoring)

## What shipped
The v1 write API + atomic DB logic (ADR-010):
- **4 Edge Functions (Deno)** under `supabase/functions/`: `save-prediction`, `create-pool`, `join-pool` (JWT), `compute-score` (x-admin-secret). Plus `_shared/` (clients, respond/error-map, pure `scoring.ts`, `inviteToken.ts`) and `scoring.test.ts`.
- **Atomic plpgsql functions** (migration `20260630130000_write_functions.sql`, SECURITY DEFINER, `auth.uid()`): `fn_create_pool` (pool + owner membership atomic; public-name uniqueness), `fn_join_pool` / `fn_join_pool_by_token` (advisory-lock capacity check + idempotent), `fn_save_prediction` (onboarding/membership/eligibility/lock, knockout-draw penalty rule, per-scope upsert + dual global+pool, lock-clear two-step).
- `config.toml`: per-function `verify_jwt` (compute-score = false).

## Ported business rules (from betmeet-clone)
Scoring EXACT=5 / RESULT=2(+1 per exact team goal) / PARTIAL=1 / MISS=0 / penalty bonus +1; scores 0–20; capacity 2–100; token charset (no ambiguous) len 8→12, 5 retries; editable only SCHEDULED+future-kickoff+both-teams; penalty winner only on knockout draw.

## ADRs
ADR-010 — Edge Functions write API + plpgsql SECURITY DEFINER atomicity.

## Verification
- Migration applied over Bolt 3 on ephemeral PG17; all functions exercised: create-pool OK, NAME_TAKEN, save (editable) OK, join OK, FULL, idempotent rejoin, LOCKED after kickoff (lock persists), lock-guard rejects direct edits. **A real bug was caught + fixed** (raise-after-lock rolled back the lock → switched to return).
- Scoring Deno tests authored (run in CI/deploy; Deno not installed locally).

## User action to activate
1. `supabase db push` (adds the write-functions migration).
2. `supabase functions deploy save-prediction create-pool join-pool compute-score`.
3. `supabase secrets set ADMIN_SECRET=<value>` (for compute-score).

## Carried forward
- Live `functions.invoke` + compute-score E2E after deploy + a seeded finished match (Bolt 5).
- `set-nickname` (discriminator) fn → Bolt 6; `leave`/`kick`/`delete-pool` → Bolt 8.
- Re-join after leaving (archived membership) edge case → revisit in Bolt 8.

## Next
Bolt 5 — Backend: manual World Cup teams + fixture seed.
