# Intent 001 — System Context

> AI-DLC Inception artifact. How the mobile app is structured and how it talks to its **own Supabase backend**. Refined by ADRs during Construction. Pairs with `requirements.md`.
>
> **Re-scoped 2026-06-26 (ADR-007).** Was "pure client of the frozen betmeet-clone backend"; that backend has no mobile-callable data API (server-actions only). New direction: **own backend in the user's Supabase** — RLS reads + Edge Function writes, mobile-direct, no Next.js. betmeet-clone is the blueprint, not a runtime dependency.

## 1. Context boundary
```
┌──────────────────────────── Betmeet Mobile (RN 0.86 + Re.Pack) ─────────────────────────────┐
│  App shell (host): Auth ► Onboarding ► App tabs (Matches│Pools│Rankings) · Deep links        │
│  Data/session layer: @supabase/supabase-js · secure token storage · TanStack Query cache     │
└───────────────┬───────────────────────────────────────────────────┬──────────────────────────┘
                │ reads: PostgREST + RLS (user JWT)                   │ writes: functions.invoke
                ▼                                                     ▼
        ┌──────────────────────── User's OWN Supabase project (BUILT this scope) ───────────────────┐
        │  Auth (existing) · Postgres + RLS (schema from betmeet-clone blueprint)                    │
        │  Edge Functions (Deno): save-prediction (lock), create-pool, join-pool, scoring            │
        │  Storage (default avatars) · manual match seed                                             │
        │  DEFERRED: football-data.org sync · push · email                                           │
        └────────────────────────────────────────────────────────────────────────────────────────┘
              (blueprint reference, NOT a runtime dependency:  ../betmeet-clone  Next.js+Prisma)
```
The mobile app talks **directly** to the user's Supabase. There is **no Next.js server** in the runtime. The backend (schema/RLS/Edge Functions) is built in dedicated backend bolts before the mobile write bolts.

## 2. Bundle topology — single bundle, host-only (v1)
- **Decision:** one Re.Pack/Rspack bundle. **No Module Federation in v1** (consistent with `memory-bank/standards/system-architecture.md`).
- All five units compile into the host bundle. No `ScriptManager`, no remote build/serve, no `/repack-init` until reversed.
- **Future remote candidates** (record now, act later — only if/when on-demand chunking is justified):
  | Unit | Remote candidate? | Rationale |
  |---|---|---|
  | Auth | No | Needed at boot; must be in host. |
  | Onboarding | No | Gates the shell; needed early. |
  | Matches & Predictions | Maybe | Self-contained feature surface; a plausible first remote later. |
  | Pools | Maybe | Self-contained; good remote candidate. |
  | Leaderboard | Maybe | Read-only, infrequently entered; lazy-load friendly. |
  - Trigger to revisit: bundle size exceeds budget, or independent release cadence per feature becomes valuable. Until then, screen-level lazy loading inside the single bundle covers the perf need.

## 3. Navigation architecture (host concern)
- **Library:** a native navigator (proposed `@react-navigation/native` native-stack + bottom-tabs; final pick is an ADR in the App-shell bolt — `requirements.md` Q3).
- **Top-level state machine:**
  1. **Booting** — read session from secure storage, hydrate Supabase client.
  2. **Unauthenticated** → **Auth stack** (Sign in / Sign up / Forgot / Reset / Verify-email).
  3. **Authenticated + email unverified** → verify-email gate (FR-A7).
  4. **Authenticated + `onboardingCompleted=false`** → **Onboarding stack** (FR-O1).
  5. **Authenticated + onboarded** → **App tabs**: Matches · Pools · Rankings.
     - Pools tab is a nested stack: list → new → discover → detail → leaderboard.
- Settings is **not** in v1 (deferred); sign-out is exposed from a lightweight menu in the app shell.

## 4. Deep-link routing (`betmeet://`)
| Link | Target | Requirement |
|---|---|---|
| `betmeet://auth/confirm?token_hash=…&type=…` | Verify-email / confirm action | FR-A2 |
| `betmeet://auth/reset?token_hash=…` | Reset-password screen | FR-A5 |
| `betmeet://pools/join/TOKEN` | Join-by-token → pool detail | FR-P4 |
- Router resolves links pre- and post-auth: a `pools/join` link while unauthenticated parks the intent, runs auth/onboarding, then completes the join.
- Custom scheme for v1; Universal Links / App Links (https) tracked as Q4 for reliable open-from-mail behavior.

## 5. Data & session layer (own Supabase — ADR-007)
- **Client:** `@supabase/supabase-js` pointed at the **user's own** Supabase project. RLS enforces authorization.
- **Session:** access + refresh tokens in **encrypted secure storage** (Keychain/Keystore), not plain AsyncStorage (NFR-5). PKCE; secure-storage adapter + autoRefresh (Bolt 0/1). Sign-out clears both.
- **Reads:** PostgREST `select` (fixture, pools, memberships, profile gate) under **RLS** (role `authenticated`), wrapped in TanStack Query; invalidate on write + screen focus; `staleTime` replaces ISR. Aggregated rankings/leaderboard come from scoring computed in Edge Functions (read the resulting tables/rows).
- **Writes:** via **Edge Functions** (`supabase.functions.invoke('save-prediction' | 'create-pool' | 'join-pool', …)`), which carry the business logic (lock-at-kickoff, capacity, token gen, atomicity, discriminator, scoring). The client never writes those tables directly.

## 6. Write-path resolution (was TOP RISK — RESOLVED by ADR-007)
The audit (`bolts/bolt-2-write-path-audit/`) confirmed the betmeet-clone backend exposes data only via Next.js server actions (uncallable from mobile). **Resolution:** build an own Supabase backend — reads via RLS, **writes via Edge Functions** that port the server-action logic. Per-operation classification lives in ADR-007. Mobile write bolts are **blocked until the backend minimum exists** (schema+RLS → Edge Functions → match seed).

## 7. Domain model (mirrors betmeet-clone `prisma/schema.prisma`, snake_case in our DB)
- **profiles** (id=auth.users.id, nickname_base/discriminator, avatar_url/source, onboarding_completed, locale)
- **matches** (teams or placeholders, kickoff_at, status, scores, winner_team_id)
- **predictions** (user_id, match_id, home_score, away_score, penalty_winner_team_id, locked_at)
- **prediction_scores** (matched_case, base_points, penalty_points, total) — written by the scoring Edge Function.
- **pools** (name, type, capacity, invite_token, owner_id) / **pool_memberships** (pool_id, user_id, joined_at, archived_at)
The schema is **owned by our backend** (built from the blueprint); the mobile app consumes DTO-shaped projections.

## 8. Cross-cutting standards hooks
- Perf: FlashList everywhere a list scrolls; lazy-load Pools-detail/leaderboard screens (NFR-2/3).
- i18n: mirror web `es`/`en` dictionaries; `i18n-doc-sync` applies to any bilingual docs (NFR-7).
- Testing: RNTL for components/flows; `agent-device` for auth, deep-link join, prediction submit (NFR-9).
- New Architecture (Fabric/TurboModules) on; pick native-module-backed libs (secure storage, navigation, OAuth) that support it.
