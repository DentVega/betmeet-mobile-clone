# Intent 001 — Betmeet Mobile v1 (RN + Re.Pack migration)

> AI-DLC Inception artifact. Source of truth for what v1 must do. Traces forward to `system-context.md` → `units/*/unit-brief.md` → `stories/` → bolts.

## Business intent
Rebuild **betmeet-clone** — a World Cup 2026 prediction pool ("quiniela") web app (Next.js + Supabase + Prisma) — as a **bare React Native 0.86 + Re.Pack 5** mobile app with its **own Supabase backend**.

> **Re-scoped 2026-06-26 (ADR-007).** The original plan ("reuse the betmeet-clone backend unchanged") proved infeasible — that backend exposes data only through Next.js server actions, which a mobile client cannot call (see `bolts/bolt-2-write-path-audit/`). New direction: build an **own backend in the user's existing Supabase project** (today Auth-only), using betmeet-clone as the **blueprint**. Architecture = **Supabase Postgres + RLS (reads) + Edge Functions/Deno (writes)**, mobile talks **directly to Supabase — no Next.js server**. betmeet-clone remains the source-of-truth reference for schema and business logic, not a runtime dependency.

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
| **Backend** | **Own backend in the user's Supabase** (ADR-007): core schema + RLS + Edge Functions, blueprinted on betmeet-clone. Mobile-direct, no Next.js. |
| **Backend v1 minimum** | Core schema + RLS; Edge Functions for `savePrediction` (locking), pools create/join, basic scoring; **manual match seed**. |
| **Backend deferred** | Live football-data.org sync, push notifications, transactional email. |
| **Admin** | Out of scope. |

## v1 Units
**Backend (own Supabase — new):**
- **B-Schema** — core tables + RLS applied to the user's Supabase (blueprint: betmeet-clone `prisma/schema.prisma`).
- **B-Functions** — Edge Functions: savePrediction (kickoff lock), pools create/join (capacity/token/atomicity), basic scoring.
- **B-Seed** — manual seed of World Cup matches/teams.

**Mobile (RN):**
1. **Auth** — registration, login (email + Google), email verification, password reset, session lifecycle. _(done — Bolt 1)_
2. **Onboarding** — nickname assignment + default-avatar selection + rules acknowledgement; gates the app shell.
3. **Matches & Predictions** — view fixture grouped by day, submit/edit predictions before kickoff.
4. **Pools** — create, discover/join public, join-by-token, view detail, manage membership (leave/kick/delete).
5. **Leaderboard & Rankings** — global ranking + per-pool leaderboard (read-only; scoring runs in Edge Functions).

App shell / navigation is a cross-cutting concern of the host, not a unit (see `system-context.md`). Mobile write bolts (2–4 above) are **blocked until the backend minimum exists**.

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
- **FR-L3** Read-only on mobile — scoring runs in **Edge Functions** (own backend); mobile only displays results and refetches on focus.

### FR-BK — Backend (own Supabase — new this re-scope)
- **FR-BK1** Apply core schema to the user's Supabase (blueprint: betmeet-clone `prisma/schema.prisma`, snake_case): `profiles`, `pools`, `pool_memberships`, `matches`, `predictions`, `prediction_scores` (+ supporting enums/indexes for v1).
- **FR-BK2** RLS policies: authenticated own-row reads (profile, predictions), own+public pools and memberships, matches readable; writes restricted (mutations go through Edge Functions, not direct table writes).
- **FR-BK3** Edge Function `save-prediction`: validate auth + onboarding, match status/eligibility, **lock at kickoff**, score range, upsert prediction (mirrors web `savePrediction`).
- **FR-BK4** Edge Functions for pools: `create-pool` (name uniqueness, invite-token gen, atomic owner membership), `join-pool` (public + by-token, capacity, duplicate check). Leave/kick/delete via RLS-guarded writes or functions as needed.
- **FR-BK5** Basic scoring: compute `prediction_scores` for finished matches (deterministic, mirrors web `computeScore`); invoked on result entry (manual/seed for v1).
- **FR-BK6** Manual seed of World Cup teams + matches for v1.
- _Deferred:_ live football-data.org sync, notifications, email.

## Non-functional requirements
- **NFR-1 Stack:** RN 0.86 (New Arch), React 19.2, TypeScript strict, **Re.Pack 5 / Rspack only — never Metro.** Single bundle.
- **NFR-2 Lists:** FlashList for fixture, pool lists, and leaderboards (per project standards).
- **NFR-3 Performance:** 60 FPS target; no JS-thread blocking on list scroll; lazy-load heavy screens.
- **NFR-4 Data layer:** client-side fetching + caching (no SSR/RSC, no `unstable_cache`). A single data-fetching/cache library (e.g. React Query) to be chosen at the first stateful bolt's Design stage; cache invalidated on prediction submit, pool mutations, and screen focus.
- **NFR-5 Session security:** tokens in encrypted secure storage (Keychain / Keystore via `expo-secure-store` or `react-native-keychain`), never plain AsyncStorage.
- **NFR-6 Backend transport:** `@supabase/supabase-js` against the **user's own Supabase**; reads via PostgREST+RLS, writes via Edge Functions (`supabase.functions.invoke`). No Next.js server.
- **NFR-7 i18n:** mirror the web `es`/`en` dictionaries; default `es`. Keep parity with web copy where practical.
- **NFR-8 Deep linking:** register the `betmeet://` URL scheme (+ associated/app-links later) for email confirm, password reset, and pool join.
- **NFR-9 Testing:** React Native Testing Library for components/flows; `agent-device` for on-device E2E of auth, deep-link join, and prediction submit.

## Constraints & assumptions
- **C1** The backend is **built in the user's own Supabase** (ADR-007), blueprinted on betmeet-clone. betmeet-clone is a reference, not a runtime dependency. Business logic (locking, capacity, scoring, discriminator) lives in Edge Functions, mirrored from the web server actions.
- **C2** Push notifications are deferred to v2 — no notification backend in v1.
- **C3** Passkeys/MFA are not surfaced in v1 mobile UI.
- **A1** The user's Supabase project allows applying schema/RLS/Edge Functions (it is theirs).
- **A2** Default avatar assets are served from a URL the mobile app can consume directly.

## Open questions / risks
- **Q1 — RESOLVED (ADR-007):** mobile cannot call the web's server actions; v1 uses an **own Supabase backend** (RLS reads + Edge Function writes). Backend bolts are inserted before the mobile write bolts.
- **Q2 (data lib):** RESOLVED in Bolt 0 — TanStack Query + Zustand.
- **Q3 (navigation lib):** RESOLVED in Bolt 0 — React Navigation v7.
- **Q4 (deep-link domain):** Universal Links / App Links (https) vs custom scheme — still deferred.
- **Q5 (backend repo location):** RESOLVED — the `supabase/` project (migrations + Edge Functions) is versioned **in this repo** (`betmeet-mobile-clone/supabase/`).

## Traceability
Every story under `units/*/stories/` references one or more FR IDs above; every FR mirrors a web requirement (FR-REFINE-* / unit) noted inline.
