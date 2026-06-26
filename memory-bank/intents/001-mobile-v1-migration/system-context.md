# Intent 001 — System Context

> AI-DLC Inception artifact. How the mobile app is structured and how it talks to the (frozen) backend. Refined by ADRs during Construction. Pairs with `requirements.md`.

## 1. Context boundary
```
┌──────────────────────────── Betmeet Mobile (RN 0.86 + Re.Pack, NEW) ─────────────────────────────┐
│  App shell (host)                                                                                 │
│   ├─ Auth stack ──────────► Onboarding stack ──────────► App tabs                                 │
│   │                                                       (Matches │ Pools │ Rankings)            │
│   └─ Deep-link router (betmeet://)                                                                 │
│                                                                                                    │
│  Data/session layer:  @supabase/supabase-js  +  secure token storage  +  client cache (React Query?)│
└───────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                                  │  HTTPS (anon key + JWT, RLS)
                                                  ▼
                        ┌──────────── EXISTING backend — FROZEN, NOT migrated ────────────┐
                        │  Supabase Auth · Supabase Postgres (PostgREST + RLS) · Storage   │
                        │  Next.js server actions / route handlers · football-data.org sync │
                        │  Resend email · Web Push dispatch (unused by mobile in v1)         │
                        └──────────────────────────────────────────────────────────────────┘
```
The mobile app is a **pure client** of the existing system. Nothing server-side changes for v1.

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

## 5. Data & session layer
- **Client:** `@supabase/supabase-js` pointed at the existing Supabase project (anon key); RLS enforces authorization exactly as for web (NFR-6).
- **Session:** access + refresh tokens in **encrypted secure storage** (Keychain/Keystore), not plain AsyncStorage (NFR-5). Supabase client configured with a secure-storage adapter + autoRefresh. Sign-out clears both.
- **Reads:** PostgREST `select` (fixture, pools, memberships, rankings) wrapped in a client cache (React Query candidate — NFR-4, Q2). Invalidate on prediction submit, pool mutations, and screen focus. No ISR/`unstable_cache` equivalent — replaced by `staleTime` + focus refetch.
- **Writes:** see the integration risk below.

## 6. Integration risk — server actions vs callable API (TOP RISK)
The web performs mutations as **Next.js server actions** (`signUp`, `signIn`, `savePrediction`, `createPool`, `joinPublicPool`, `joinPoolByToken`, `leavePool`, `kickMember`, `deletePool`, `setNickname`, `completeOnboarding`, …). These are **not callable from a mobile client**. For each v1 write, exactly one of:
1. It maps directly to a **Supabase Auth** SDK call (most auth flows: signUp, signIn, OAuth, reset, verify). ✅ low risk.
2. It maps to a **PostgREST insert/update** permitted by RLS (e.g. upsert prediction, create membership). ⚠️ verify RLS allows it and that no server-only business logic (capacity checks, lock-at-kickoff, scoring) is bypassed.
3. It needs server-side logic that only exists inside a server action → **requires exposing a thin endpoint / Postgres RPC** on the backend. ❗ This is the one place the "don't touch the backend" rule may need a narrowly-scoped exception; surface it to the user, don't silently edit the backend.
- **Action:** the first Pools/Predictions Construction bolt opens with a write-path audit mapping every v1 mutation to (1)/(2)/(3). Recorded as an ADR.

## 7. Domain model (client-side view; mirrors `prisma/schema.prisma`, read-only ownership)
- **Profile** (id=auth.users.id, nicknameBase/Discriminator, avatarUrl/Source, onboardingCompleted, locale)
- **Match** (teams or placeholders, kickoffAt, status, scores, winnerTeamId)
- **Prediction** (userId, matchId, homeScore, awayScore, penaltyWinnerTeamId, lockedAt)
- **PredictionScore** (matchedCase, basePoints, penaltyPoints, total) — server-computed, read-only on mobile.
- **Pool** (name, type, capacity, inviteToken, ownerId) / **PoolMembership** (poolId, userId, joinedAt, archivedAt)
The mobile app holds no schema ownership; entities are DTO-shaped projections of server data.

## 8. Cross-cutting standards hooks
- Perf: FlashList everywhere a list scrolls; lazy-load Pools-detail/leaderboard screens (NFR-2/3).
- i18n: mirror web `es`/`en` dictionaries; `i18n-doc-sync` applies to any bilingual docs (NFR-7).
- Testing: RNTL for components/flows; `agent-device` for auth, deep-link join, prediction submit (NFR-9).
- New Architecture (Fabric/TurboModules) on; pick native-module-backed libs (secure storage, navigation, OAuth) that support it.
