# Bolt 2 — Write-Path Audit (spike): method & inventory

> Not a feature bolt. Goal: determine, for every v1 data operation, whether a React Native client can reach it against the **frozen** backend — and where it can't, surface options to the user (never silently edit the backend). Output: classification ADR + a data-access plan. Traces to `system-context.md` §6 and `bolt-plan.md` Bolt 2.

## Classification taxonomy
- **Class 1 — Supabase Auth SDK**: reachable via `@supabase/supabase-js` auth (no data API needed). _Already implemented in Bolt 1._
- **Class 2 — PostgREST + RLS**: a direct table read/write through the Supabase REST API, permitted by Row-Level-Security, with no server-only business logic bypassed.
- **Class 3 — Needs server code**: requires a callable endpoint / Postgres RPC because (a) the table isn't exposed to the API, or (b) server-only business logic must run (capacity, lock-at-kickoff, scoring, token gen, ownership).

## v1 operation inventory (to classify)
**Reads:** getFixtureByDayWithMyPredictions, getMyPools, listPublicPools, getPoolDetail, getPoolLeaderboard, getGlobalRankingProjection, fetchOnboardingCompleted (profile gate).
**Writes:** savePrediction · createPool, joinPublicPool, joinPoolByToken, leavePool, kickMember, deletePool · setNickname, setAvatarFromDefaultSet/Google, completeOnboarding, setLocale.
**Auth (Class 1, done):** signUp, signIn, OAuth, reset, verify, signOut.

## Method (read-only — no prod data mutated)
1. **Live API introspection** (publishable key) — probe the Supabase REST API for exposed tables. _(done — see findings.md)_
2. **Web architecture read** — confirm Prisma-direct vs supabase-js, real table/column names, any existing HTTP API, any RLS/PostgREST exposure, and per-mutation server-only logic. _(delegated)_
3. **Classify** each operation → Class 1/2/3.
4. **Decide** — if Class 3 dominates, surface backend-exposure options to the user (the backend is otherwise frozen).
5. **Fix** the Bolt 1 `profileGate` table/column names to the confirmed real ones (or document why it stays defensive).

## Constraint
The backend is frozen by the migration brief ("NO migrar DB/Prisma/servidor"). Any finding that the app *cannot* work without a backend addition is a decision for the user, presented with options — not an action taken unilaterally.
