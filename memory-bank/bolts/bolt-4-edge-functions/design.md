# Bolt 4 — Stage 2: Design (Backend Edge Functions)

> Implements the Stage-1 rules. Edge Functions (Deno) are the mobile-facing write API; **atomic writes are delegated to plpgsql SECURITY DEFINER functions** (supabase-js can't do multi-statement transactions). Choices → `adr/`.

## Atomicity strategy (the core decision) — ADR-010
- **Edge Function (Deno)** = public API the app calls via `supabase.functions.invoke(...)`. Responsibilities: JWT verification, input parsing/validation (zod, ported rules), error mapping, and the pieces that genuinely need code — **invite-token generation/retry** (create-pool) and **scoring math** (compute-score).
- **plpgsql functions** (`SECURITY DEFINER`, read `auth.uid()`) do the **atomic** DB work: `fn_create_pool`, `fn_join_pool`, `fn_save_prediction`. Called from the Edge Function with the caller's JWT, so `auth.uid()` resolves inside; `SECURITY DEFINER` lets them write the tables that have no client RLS write policy.
- This keeps true transactionality in the DB and faithful rule-porting in TS, without TOCTOU races (e.g. capacity check + insert in one statement-set).
- _(Alternative considered: skip Edge Functions and call the plpgsql functions directly via `supabase.rpc()`. Rejected to keep a single typed write API + room for future server logic — but the functions are designed so this remains possible.)_

## Layout
```
supabase/
├── migrations/20260630130000_write_functions.sql   # fn_create_pool, fn_join_pool, fn_save_prediction (plpgsql, SECURITY DEFINER)
└── functions/
    ├── _shared/
    │   ├── cors.ts          # CORS headers
    │   ├── clients.ts       # userClient(req) (Authorization passthrough) + adminClient() (service role)
    │   ├── validate.ts      # zod schemas (prediction, create-pool, join)
    │   ├── scoring.ts       # pure computeScore() (EXACT/RESULT/PARTIAL/MISS + penalty) — unit-tested
    │   ├── inviteToken.ts   # charset gen (len 8, fallback 12)
    │   └── respond.ts       # json() + mapError() → stable codes
    ├── save-prediction/index.ts
    ├── create-pool/index.ts
    ├── join-pool/index.ts
    └── compute-score/index.ts
```
`config.toml` `[functions]`: `verify_jwt = true` for save-prediction/create-pool/join-pool; **`verify_jwt = false` for compute-score** (guarded by an `x-admin-secret` header + env, since v1 result entry is manual/maintenance, no admin user role).

## Function behaviors
- **save-prediction** (JWT): parse+range-validate; call `fn_save_prediction(p_match, p_home, p_away, p_pen, p_pool, p_also_global)`. The plpgsql fn: assert onboarding; assert membership if pool; compute eligibility from the match row + `now()` (editable iff SCHEDULED + future kickoff + both teams); if not editable → lock any unlocked row and raise `LOCKED`; enforce knockout/draw penalty rule; upsert per scope, clearing a stale lock first (two-step vs the lock-guard trigger); dual upsert (global+pool) in the same transaction when `p_also_global`.
- **create-pool** (JWT): zod (name 3–60, capacity 2–100, type, membersCanInvite); generate token (5 retries); call `fn_create_pool(...)` (insert pool + owner membership atomically; owner = `auth.uid()`). On `unique_violation` for the public-name index → `NAME_TAKEN`; on token collision → regenerate + retry.
- **join-pool** (JWT): body `{poolId}` or `{token}`. Normalize token to UPPERCASE. Call `fn_join_pool(p_pool)` / `fn_join_pool_by_token(p_token)`: resolve pool, check PUBLIC (for poolId path), idempotent if already a member, capacity check (`count >= capacity` → `FULL`), insert membership — all in one transaction.
- **compute-score** (admin secret): body `{matchId}`. Load match (+phase.type, winner) and its predictions via service role; if not scoreable (`status≠FINISHED` or null scores) → `DELETE prediction_scores WHERE match_id`; else compute rows in TS (`scoring.ts`) and `upsert` on `prediction_id`. Idempotent. (A DB trigger on `matches` is a future alternative; v1 invokes this after entering a result in the seed/maintenance step — Bolt 5.)

## Error model
Functions return `{ ok:false, code, message }` with stable codes: `UNAUTHENTICATED, NOT_ONBOARDED, NOT_MEMBER, LOCKED, INVALID, NOT_FOUND, FULL, NAME_TAKEN, ALREADY_MEMBER(info), RATE_LIMITED, INTERNAL`. The mobile layer maps codes → i18n (mirrors the Bolt 1 `mapAuthError` pattern).

## Mobile call surface (Phase C will use)
`supabase.functions.invoke('save-prediction', { body })`, etc. Reads stay on PostgREST+RLS (Bolt 3).

## Test surface (Stage 5)
- **Pure unit (Deno test):** `scoring.ts` truth table (EXACT/RESULT/PARTIAL/MISS, penalty bonus on/off, sign edge cases); `inviteToken.ts` (charset/length); zod schemas.
- **plpgsql on ephemeral PG17:** apply the new migration over Bolt 3; exercise `fn_create_pool` (atomic + name-dup), `fn_join_pool` (capacity + idempotent), `fn_save_prediction` (eligibility lock, dual upsert, lock-guard interaction) with seeded rows + a fake `auth.uid()`.
- Live invoke against the real project deferred to after `supabase functions deploy` (user step, like db push).
