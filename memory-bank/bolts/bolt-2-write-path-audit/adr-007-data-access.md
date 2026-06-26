# ADR-007 — Mobile data access strategy

- **Status:** **Accepted** (2026-06-26).
- **Decision:** Build an **own backend in the user's existing Supabase project** (today Auth-only), using `../betmeet-clone` as the blueprint. Architecture = **Supabase Postgres + RLS for reads, Edge Functions (Deno) for writes**; the mobile app talks **directly to Supabase** — there is **no Next.js server** in the mobile stack. This supersedes the original "reuse the frozen backend" framing (which the audit proved infeasible).
- **Context:** Audit (findings.md) showed `betmeet-clone` exposes data only through Next.js server actions + Prisma-direct; no callable data API; RLS SELECT-only; writes carry server-only business logic. The user's `.env` points at **their own** Supabase project, so building the backend there is in scope (not a migration of betmeet-clone).

## Classification of v1 operations
| Operation | Class | Reachable today? | Note |
|---|---|---|---|
| Auth (signup/in/oauth/reset/verify/signout) | 1 | ✅ | Bolt 1, done |
| fetchOnboardingCompleted (`profiles.onboarding_completed`) | 2 | ✅ with user JWT | confirm RLS own-row SELECT |
| getMyPools / listPublicPools / getPoolDetail | 2 | ✅ with user JWT | `pools`,`pool_memberships` SELECT |
| getFixtureByDay (raw `matches`) | 2 | ✅ with user JWT | day-grouping is client-side |
| getMyPredictions (`predictions` own) | 2 | ✅ with user JWT | |
| getGlobalRankingProjection / getPoolLeaderboard | 3 | ❌ | server-computed scoring/projection |
| savePrediction | 3 | ❌ | kickoff lock, eligibility, atomic save |
| createPool/join(public/token)/leave/kick/delete | 3 | ❌ | capacity, ownership, token, atomicity |
| setNickname / completeOnboarding / setAvatar* / setLocale | 3 | ❌ | discriminator, cooldown, token refresh |

**Class 2 = empty for anon; requires authenticated JWT. Class 3 (all writes + rankings) requires server code.**

## Chosen architecture — own Supabase backend (RLS + Edge Functions)
- **Reads:** PostgREST against the user's Supabase, gated by **RLS** (own profile/predictions, own+public pools, memberships, matches). Authenticated user JWT (role `authenticated`).
- **Writes & server logic:** **Supabase Edge Functions** (Deno) verify the JWT and run the business logic ported from the `betmeet-clone` server actions — `savePrediction` (kickoff lock), pool `create`/`join` (capacity/token/atomicity), and **basic scoring**. No write done directly from the client.
- **Schema:** core tables + RLS applied to the user's Supabase via migrations, modeled on `betmeet-clone`'s `prisma/schema.prisma` (snake_case: `profiles`, `pools`, `pool_memberships`, `matches`, `predictions`, `prediction_scores`).
- **Matches data:** **manual seed** for v1.
- **Deferred (not v1 backend):** live football-data.org sync, push notifications, transactional email.

### Options considered (for the record)
- A — thin HTTP API in betmeet-clone's Next.js (rejected: keeps a Next.js server in the loop; user owns a Supabase project instead).
- B — PostgREST + Postgres RPC only (partially adopted: RLS reads; writes use Edge Functions rather than plpgsql to keep logic in TS/Deno close to the blueprint).
- **E (CHOSEN)** — own Supabase backend: RLS reads + Edge Function writes, mobile-direct.

## Consequence
- **New backend bolts are inserted before the mobile write bolts** (see updated `bolt-plan.md`): schema+RLS → Edge Functions → match seed.
- Onboarding/Predictions/Pools/Leaderboard remain blocked until the minimal backend exists.
- `requirements.md` and `system-context.md` are re-scoped from "frozen reuse" to "own Supabase backend".
- Bolt 1 `profileGate` names already corrected to `profiles`/`onboarding_completed`.
