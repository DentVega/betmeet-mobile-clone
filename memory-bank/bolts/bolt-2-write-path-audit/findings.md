# Bolt 2 — Findings

## Live API probe (read-only, publishable key)
Date: 2026-06-26. Project: `https://uyhymoykzwlovnqpzwnn.supabase.co`.

1. **OpenAPI root** (`GET /rest/v1/`) → `401 "Secret API key required — Only secret API keys can be used for this endpoint."` The publishable key cannot read the schema root (expected for the new key format).
2. **Table probes** with the publishable key (apikey + Bearer), `GET /rest/v1/<table>?select=*&limit=1`:
   - The key **authenticates to PostgREST** (no 401 on table requests).
   - **Every candidate table → `404 PGRST205 "Could not find the table 'public.<X>' in the schema cache"`**: tried `profiles, profile, Profile, pools, Pool, pool, matches, Match, prediction, Prediction, predictions, pool_memberships, PoolMembership`.

### Interpretation
The application's data tables are **not exposed via the Supabase PostgREST API**. The data layer is reached server-side (Prisma/direct connection) by the web app, not through the REST API. Therefore a React Native client **cannot read or write any app data via PostgREST today** — only Supabase **Auth** is reachable.

## Consequence for classification
- **Class 1 (Auth):** ✅ works (Bolt 1).
- **Class 2 (PostgREST+RLS):** ❌ currently **empty** — no app table is exposed; RLS is moot if the table isn't in the API schema.
- **Class 3 (needs server code):** ⚠️ **everything else** — all v1 reads and writes (fixtures, pools, predictions, profile/onboarding, leaderboards).

This is the migration's central gap: the brief says reuse the backend **without touching it**, but the backend exposes data only through Next.js server actions / RSC (not callable from mobile) and has no REST/PostgREST data surface. v1 cannot function beyond auth without a **narrowly-scoped backend addition**. → decision surfaced to the user (see decision.md / ADR).

## Web-architecture confirmation (repo read)
- **Data access is Prisma-direct**, server-side only. `src/lib/prisma.ts` connects with `DATABASE_URL` (pooler) via `PrismaPg`. The Supabase client (`src/lib/supabase/client.ts`) is **auth-only**; no `supabase.from(...)` data calls.
- **Real table/column names** (Prisma `@map`, snake_case): `profiles` (`onboarding_completed`, `nickname_base`, `nickname_discriminator`, `avatar_url`), `pools`, `pool_memberships`, `matches`, `predictions`, `prediction_scores`.
- **No data HTTP API exists.** Only 4 infra routes: `/api/csp-report`, `/api/auth/email-hook`, `/api/cron/sync`, `/api/notifications/dispatch`. No tRPC/GraphQL/REST for data. All mutations are `"use server"` server actions under `src/features/{pools,profile,predictions}/actions/`.
- **RLS** (migration `20260611120000_rls_constraints_triggers`): tables in `public` with RLS on; policies are **SELECT-only** for `authenticated` (e.g. own predictions, own/public pools, own profile). **No INSERT/UPDATE/DELETE policies** — writes are forced through server code. `anon` has no grants (hence my anon probe saw no tables).
- **Server-only business logic per write** (cannot be reproduced by a plain table write): savePrediction (kickoff lock, status/eligibility, score range, atomic global+pool save); createPool (name uniqueness, token gen, atomic owner-membership); join/leave/kick/delete (capacity, ownership, atomicity); setNickname (regex, 30-day cooldown after 2 changes, discriminator assignment); completeOnboarding (flag + auth-token refresh for the access-token hook).

## Refined verdict
- **Reads:** reachable via **PostgREST with an authenticated user JWT** (role `authenticated` has SELECT policies) for simple cases — own profile (gate), own predictions, my pools, public pools, raw matches. **Aggregated/computed reads (global ranking projection, pool leaderboard points) are server-computed → Class 3** (or heavy client-side aggregation over `prediction_scores`).
- **Writes:** **all Class 3** — no write RLS policies + server-only business logic. Cannot be done from the client even with a JWT.
- **Conclusion:** mobile v1 **requires a backend addition** (a thin authenticated HTTP API and/or write RLS+RPC). The "don't touch the backend" brief is infeasible for a functional app → user decision required.
