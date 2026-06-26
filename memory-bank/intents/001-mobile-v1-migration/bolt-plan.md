# Intent 001 — Bolt Plan

> AI-DLC Inception artifact. Sequenced execution units for v1. Each bolt runs the Construction DDD stages (Model → Design → ADR → Implement → Test) via `/bolt-start`.
>
> **Re-sequenced 2026-06-26 (ADR-007).** The write-path audit (Bolt 2) proved the betmeet-clone backend isn't mobile-callable. New direction: **own Supabase backend** (RLS + Edge Functions, mobile-direct). A **backend phase is inserted before the mobile write bolts**.

## Phases
```
Phase A — Mobile foundation   Bolt 0 Shell ✅ · Bolt 1 Auth ✅ · Bolt 2 Write-Path Audit ✅
Phase B — Own backend         Bolt 3 Schema+RLS · Bolt 4 Edge Functions · Bolt 5 Match seed
Phase C — Mobile features     Bolt 6 Onboarding · Bolt 7 Matches&Predictions · Bolt 8 Pools · Bolt 9 Leaderboard
```
Phase C is **blocked on Phase B**. Backend lives in the user's own Supabase (built from the `../betmeet-clone` blueprint).

---

## Phase A — done
- **Bolt 0 — Foundations & App Shell** ✅ — RN Navigation v7, Supabase+keychain session, TanStack Query+Zustand, deep links, i18n.
- **Bolt 1 — Auth** ✅ — US-A1…A6; 5 screens, AuthService, Google OAuth (system browser+PKCE), profile gate.
- **Bolt 2 — Write-Path Audit (spike)** ✅ — ADR-007: own backend, RLS reads + Edge Function writes.

## Phase B — Own backend (NEW)
Backend artifacts (migrations + Edge Functions) versioned under `supabase/` (location confirmed at Bolt 3 — req Q5). Blueprint: betmeet-clone `prisma/schema.prisma` + `src/features/*/actions`.

### Bolt 3 — Backend: Core schema + RLS
- **Goal:** apply the v1 core schema and RLS to the user's Supabase. (FR-BK1, FR-BK2)
- **Delivers:** migrations for `profiles`, `pools`, `pool_memberships`, `matches`, `predictions`, `prediction_scores` (+ enums/indexes); RLS — authenticated own-row reads (profile, predictions), own+public pools/memberships, matches readable; direct writes restricted (mutations go through Edge Functions). Profile row auto-created on signup (trigger) or via onboarding write.
- **ADRs:** schema mapping fidelity to blueprint; RLS policy set; profile-creation mechanism.
- **Exit:** an authenticated JWT can SELECT its own profile/predictions and public pools; the Bolt 1 `profileGate` read works against real tables.

### Bolt 4 — Backend: Edge Functions
- **Goal:** server-side write logic. (FR-BK3, FR-BK4, FR-BK5)
- **Delivers (Deno):** `save-prediction` (auth + onboarding + match status/eligibility + **lock at kickoff** + score range + upsert); `create-pool` (name uniqueness, invite-token gen, atomic owner membership); `join-pool` (public + by-token, capacity, duplicate); leave/kick/delete (function or RLS-guarded); **basic scoring** (`compute-score` over finished matches → `prediction_scores`). Logic ported from betmeet-clone server actions.
- **ADRs:** function boundaries; how scoring is triggered (manual/result-entry for v1); shared validation between mobile and functions.
- **Exit:** each function invocable with a user JWT, enforcing its rules; deployed to the user's Supabase.

### Bolt 5 — Backend: Manual match seed
- **Goal:** World Cup teams + fixture data. (FR-BK6)
- **Delivers:** seed script/migration for teams + matches (group stage + knockout placeholders), reusable to enter results (which trigger scoring).
- **Exit:** the mobile fixture read returns real matches; entering a result produces scores.

## Phase C — Mobile features (blocked on Phase B)
### Bolt 6 — Onboarding (mobile)
- **Stories:** US-O1…O4. Reads/writes `profiles` (set nickname via function or RLS update + discriminator logic; avatar from default set; complete onboarding). Resolves the gate end-to-end.
- **Depends on:** Bolt 3 (+ nickname/discriminator: Bolt 4 if function-based).

### Bolt 7 — Matches & Predictions (mobile)
- **Stories:** US-M1…M5. Fixture read (RLS) + `save-prediction` function; lock/results/points display.
- **Depends on:** Bolt 3, 4, 5.

### Bolt 8 — Pools (mobile)
- **Stories:** US-P1…P6. `create-pool`/`join-pool` functions; reads for my/public pools, detail; leave/kick/delete; deep-link join.
- **Depends on:** Bolt 3, 4.

### Bolt 9 — Leaderboard & Rankings (mobile)
- **Stories:** US-L1…L3. Read global + per-pool standings from scoring output.
- **Depends on:** Bolt 4 (scoring) + Bolt 7 (predictions) + Bolt 8 (pools).

---

## Cross-bolt notes
- **Topology:** mobile is a single Re.Pack host bundle (no Module Federation). Backend is the user's Supabase (no Next.js server).
- **Testing:** RNTL for mobile components; Edge Functions tested with Deno test + invoked against a real/staging Supabase; `agent-device` for end-to-end (auth, deep-link join, prediction submit).
- **Each bolt** keeps its `memory-bank/bolts/{bolt-id}/` with ADRs.
- **Deferred to v2 (no bolt):** live football-data.org sync, push notifications, custom avatar upload, Settings, Passkeys, MFA, directed invites, biometrics, Admin.
