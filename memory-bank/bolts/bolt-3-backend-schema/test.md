# Bolt 3 — Stage 5: Test

> The backend isn't applied to the user's Supabase by us (the user runs `db push`). Verification is done by **applying the migrations to an ephemeral local Postgres 17** with Supabase stubs (`auth.users`, `auth.uid()`, roles), which catches real SQL/DDL/policy errors offline.

## Static checks
- 7 enums · 10 `create table` · 10 `enable row level security` · 16 `create policy` · 7 triggers · balanced `$$` · all 7 referenced enum types defined.
- FK ordering verified (each table references only already-created tables).

## Live apply on ephemeral Postgres 17 (psql, local cluster via initdb/pg_ctl)
Prelude stubs: roles `anon`/`authenticated`/`service_role`, `auth` schema, `auth.users`, `auth.uid()`.
Result:
```
OK  20260630120000_enums.sql
OK  20260630120100_core_tables.sql
OK  20260630120200_rls.sql
OK  20260630120300_triggers.sql
OK  20260630120400_seed_avatars.sql
```
- **`handle_new_user` trigger works:** inserting a row into `auth.users` created exactly **1** `profiles` row (`profiles_created = 1`).
- `pg_policies` in `public` = **16**; tables with `rowsecurity` = **10**. Matches the design.
- (Docker was unavailable; used a throwaway brew `postgresql@17` cluster, torn down after.)

## Not covered here (needs the real project / a user JWT)
- RLS *behavior* (own-row visible, others' predictions blocked) — verify after `db push` with a real authenticated token.
- `prediction_lock_guard` rejection path — exercised in Bolt 4 (save-prediction) tests.
- Storage `avatars` bucket + default images — dashboard step (README).

## Apply (user-run)
`supabase login → link --project-ref uyhymoykzwlovnqpzwnn → db push` (see `supabase/README.md`). Plus dashboard: redirect URLs + `avatars` bucket.
