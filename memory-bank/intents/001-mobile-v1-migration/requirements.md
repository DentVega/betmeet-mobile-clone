# Intent 001 — Betmeet Mobile v1 (RN + Re.Pack migration)

> AI-DLC Inception artifact. Source of truth for what v1 must do. Traces forward to `system-context.md` → `units/*/unit-brief.md` → `stories/` → bolts.

## Business intent
Migrate **betmeet-clone** — a World Cup 2026 prediction pool ("quiniela") web app (Next.js + Supabase + Prisma) — to a **bare React Native 0.86 + Re.Pack 5** mobile app. The mobile app **reuses the existing Supabase/API backend unchanged**: no DB, Prisma, or server code is migrated. Only the frontend, navigation, and Supabase session handling are built for mobile. Mobile units **mirror the web units** so the two stay conceptually aligned.

## Source of truth (web repo)
`/Volumes/SSDExterno/prodproyects/betmeet-clone`
- Requirements: `aidlc-docs/inception/requirements/requirements.md` (Units 1–37)
- API: `aidlc-docs/inception/reverse-engineering/api-documentation.md`
- Architecture: `aidlc-docs/inception/reverse-engineering/architecture.md`
- Data model: `prisma/schema.prisma`
- Screens: `src/app/(auth)/**`, `src/app/onboarding/**`, `src/app/(app)/**`
- Feature logic to mirror (not copy): `src/features/{auth,profile,predictions,competition,pools,scoring,scoring-rankings}`

## Scope decisions (locked at Inception checkpoint)
| Decision | Choice |
|---|---|
| **Auth methods** | Email/password + Google OAuth + email verification + password reset. **Passkeys & MFA deferred to v2.** |
| **Supporting units in v1** | Onboarding (nickname + default-avatar gate). **Settings and Push notifications deferred to v2.** |
| **Native capabilities** | Secure token storage (mandatory) + deep links (pool invite + email confirm). **No image picker, no biometrics in v1.** |
| **Custom avatar upload** | Deferred — v1 uses the **default avatar set only** (and Google photo when available via OAuth). |
| **Bundle topology** | **Single Re.Pack bundle, host-only. No Module Federation in v1.** |
| **Backend** | Reused as-is. No migration of Supabase schema, Prisma, server actions logic, football-data.org sync, or email/push dispatch. |
| **Admin** | Out of scope. |

## v1 Units (mirror of web)
1. **Auth** — registration, login (email + Google), email verification, password reset, session lifecycle.
2. **Onboarding** — nickname assignment + default-avatar selection + rules acknowledgement; gates the app shell.
3. **Matches & Predictions** — view fixture grouped by day, submit/edit predictions before kickoff.
4. **Pools** — create, discover/join public, join-by-token, view detail, manage membership (leave/kick/delete).
5. **Leaderboard & Rankings** — global ranking + per-pool leaderboard (read-only; scoring stays server-side).

App shell / navigation is a cross-cutting concern of the host, not a unit (see `system-context.md`).

## Functional requirements

### FR-A — Auth (mirrors web Unit "auth")
- **FR-A1** Register with email + password (client validation: email format, password ≥8 chars, confirm match). Triggers Supabase verification email. (web FR-REFINE-15.12)
- **FR-A2** Email verification via **deep link** (`betmeet://auth/confirm?token_hash=…&type=…`) → confirmed → routed to sign-in/onboarding. (web FR-REFINE-15.14)
- **FR-A3** Sign in with email + password → JWT access + refresh tokens persisted in secure storage.
- **FR-A4** Sign in / sign up with **Google OAuth** (system browser / AppAuth flow; redirect back via deep link). Account auto-linking by email handled by Supabase as on web.
- **FR-A5** Password reset: request email → reset via deep link → set new password → return to sign-in.
- **FR-A6** Session persistence + silent refresh on token expiry; sign-out clears secure storage and Supabase session.
- **FR-A7** Unverified-email gate: an unverified account cannot reach the app shell. (web FR-REFINE-15.14)

### FR-O — Onboarding (mirrors web "profile/onboarding")
- **FR-O1** App shell is gated: if `onboardingCompleted = false`, route the user into onboarding before any app screen. (web FR-REFINE-16.1)
- **FR-O2** Set nickname with case-insensitive uniqueness check (`checkNicknameAvailability` → `setNickname`); show assigned discriminator.
- **FR-O3** Choose avatar from the **default set** or the Google photo (if OAuth). Custom upload deferred to v2.
- **FR-O4** Show rules acknowledgement step.
- **FR-O5** Complete onboarding (`completeOnboarding`) → `onboardingCompleted = true` → enter app shell. Per-step Back navigation without data loss. (web FR-REFINE-16.4)

### FR-M — Matches & Predictions (mirrors web "predictions"/"competition")
- **FR-M1** Load fixture grouped by day in device-local timezone; past days collapsed by default with a toggle. (web FR-REFINE-16.2, FR-REFINE-30.1)
- **FR-M2** Each match shows teams (or placeholders for TBD knockout), kickoff time, status badge (SCHEDULED/LOCKED/LIVE/FINISHED), and the user's current prediction if any.
- **FR-M3** Submit/edit a prediction (home score, away score, and penalty winner when knockout) via `savePrediction`. Predictions **lock at kickoff** — locked matches are read-only.
- **FR-M4** Finished matches show actual result and the user's earned points (read from server-computed `PredictionScore`).
- **FR-M5** Refetch fixture/predictions on screen focus and after submitting a prediction.

### FR-P — Pools (mirrors web "pools")
- **FR-P1** List the pools the user belongs to (`getMyPools`) with name, type, member count/capacity, owner.
- **FR-P2** Create a pool (name ≤60 chars, capacity, public/private) → `createPool` → open its detail.
- **FR-P3** Discover & search public pools with pagination (`listPublicPools`); join a public pool (`joinPublicPool`) — allowed anytime. (web FR-REFINE-23.1)
- **FR-P4** Join a private pool by token, including via **deep link** `betmeet://pools/join/TOKEN` (`joinPoolByToken`).
- **FR-P5** Pool detail: header (name/owner/members/capacity), copy invite token, link to leaderboard, quick link to matches.
- **FR-P6** Membership management: leave a pool; owner can kick a member and delete the pool — allowed anytime. (web FR-REFINE-23.3)
- **FR-P7** Enforce capacity and duplicate-membership checks (server-authoritative; surface errors).
- _Out of v1:_ directed invites by email/nickname (web Unit 10) — deferred to v2.

### FR-L — Leaderboard & Rankings (mirrors web "scoring-rankings")
- **FR-L1** Global ranking (`getGlobalRankingProjection`) listing rank, nickname, avatar, total points; highlight the viewer; show live projection when matches are in progress.
- **FR-L2** Per-pool leaderboard (`getPoolLeaderboard`) of members ranked by pool points.
- **FR-L3** Read-only — all scoring (`computeScore`, sweeper) stays server-side; mobile only displays results and refetches on focus.

## Non-functional requirements
- **NFR-1 Stack:** RN 0.86 (New Arch), React 19.2, TypeScript strict, **Re.Pack 5 / Rspack only — never Metro.** Single bundle.
- **NFR-2 Lists:** FlashList for fixture, pool lists, and leaderboards (per project standards).
- **NFR-3 Performance:** 60 FPS target; no JS-thread blocking on list scroll; lazy-load heavy screens.
- **NFR-4 Data layer:** client-side fetching + caching (no SSR/RSC, no `unstable_cache`). A single data-fetching/cache library (e.g. React Query) to be chosen at the first stateful bolt's Design stage; cache invalidated on prediction submit, pool mutations, and screen focus.
- **NFR-5 Session security:** tokens in encrypted secure storage (Keychain / Keystore via `expo-secure-store` or `react-native-keychain`), never plain AsyncStorage.
- **NFR-6 Auth transport:** reuse `@supabase/supabase-js` against the existing Supabase project; no backend changes.
- **NFR-7 i18n:** mirror the web `es`/`en` dictionaries; default `es`. Keep parity with web copy where practical.
- **NFR-8 Deep linking:** register the `betmeet://` URL scheme (+ associated/app-links later) for email confirm, password reset, and pool join.
- **NFR-9 Testing:** React Native Testing Library for components/flows; `agent-device` for on-device E2E of auth, deep-link join, and prediction submit.

## Constraints & assumptions
- **C1** Backend is frozen for this migration. If a mobile flow needs an endpoint the web exposes only as a server action or RSC query, it must be reachable as an HTTP/PostgREST/Supabase call; gaps are raised, not worked around by editing the backend. _(Open risk — see below.)_
- **C2** Web Push does not exist on native; since push is deferred to v2, no notification backend change is needed in v1.
- **C3** Passkeys/MFA exist in the backend but are not surfaced in v1 mobile UI.
- **A1** The existing Supabase project allows a mobile client (anon key + RLS) to perform the same reads/writes the web does.
- **A2** Default avatar assets are served from a URL the mobile app can consume directly.

## Open questions / risks (to resolve during Construction Design)
- **Q1 (server actions vs HTTP):** The web invokes mutations as Next.js **server actions** (`savePrediction`, `createPool`, `joinPoolByToken`, etc.), not documented REST endpoints. Mobile cannot call server actions. **Need to confirm** each v1 mutation is available via PostgREST/RPC/Supabase, or define the minimal API surface to expose. This is the biggest migration risk and is flagged for the first Pools/Predictions bolt.
- **Q2 (data lib):** Final choice of data-fetching/cache + state library (React Query vs alternatives) — decide at first stateful bolt.
- **Q3 (navigation lib):** Native navigator choice (e.g. `@react-navigation/native` native-stack + bottom-tabs) — decide in the App-shell bolt.
- **Q4 (deep-link domain):** Whether to add Universal Links / App Links (https) in addition to the custom scheme for email links that open from mail apps reliably.

## Traceability
Every story under `units/*/stories/` references one or more FR IDs above; every FR mirrors a web requirement (FR-REFINE-* / unit) noted inline.
