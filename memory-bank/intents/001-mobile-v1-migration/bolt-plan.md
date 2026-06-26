# Intent 001 — Bolt Plan

> AI-DLC Inception artifact. Sequenced execution units for v1. Each bolt runs the Construction DDD stages (Model → Design → ADR → Implement → Test) via `/bolt-start`. Order respects the dependency chain and front-loads the migration's top risk.

## Sequencing rationale
Auth and the host shell unblock everything. The **write-path audit** (server-action-vs-callable-API risk from `system-context.md` §6) is pulled forward to a dedicated spike right after Auth, because every write-bearing unit (Onboarding, Predictions, Pools) depends on its outcome. Leaderboard is a read-only leaf and ships last.

```
Bolt 0 Foundations/Shell → Bolt 1 Auth → Bolt 2 Write-Path Spike(ADR) → Bolt 3 Onboarding
                                                                       → Bolt 4 Matches&Predictions
                                                                       → Bolt 5 Pools → Bolt 6 Leaderboard
```

---

## Bolt 0 — Foundations & App Shell
- **Goal:** the host scaffolding every unit relies on. No feature stories yet.
- **Delivers:** native navigator wiring (auth/onboarding/tabs state machine), Supabase client + **secure-storage session adapter**, deep-link router for `betmeet://`, client data-fetching/cache library, i18n base (`es`/`en` mirror), FlashList baseline.
- **Key ADRs:** navigation library (Q3); data-fetching/state library (Q2); secure-storage library (NFR-5); deep-link scheme + Universal/App-Links decision (Q4).
- **Native modules:** secure storage; deep linking. (No image picker, no push.)
- **Depends on:** nothing.
- **Exit criteria:** app boots, resolves "no session → Auth stack", and a test deep link routes correctly.

## Bolt 1 — Auth
- **Goal:** full v1 auth surface.
- **Stories:** US-A1…US-A6.
- **Key ADRs:** Google OAuth flow on RN (system browser + deep-link return); session refresh strategy.
- **Native modules:** secure storage; deep links (confirm/reset).
- **Depends on:** Bolt 0.
- **Exit criteria:** sign-up→verify→sign-in, Google sign-in, reset, and sign-out all work against the real Supabase project; session survives relaunch.

## Bolt 2 — Write-Path Audit (spike → ADR)
- **Goal:** de-risk the migration. Map **every v1 mutation** (`setNickname`, `completeOnboarding`, `savePrediction`, `createPool`, `joinPublicPool`, `joinPoolByToken`, `leavePool`, `kickMember`, `deletePool`) to a callable path: class 1 (Supabase SDK), class 2 (PostgREST + RLS), or class 3 (needs a thin endpoint/RPC).
- **Delivers:** an ADR table classifying each mutation, RLS/behavior probes (using the Bolt 1 session), and — for any class-3 — a **surfaced decision to the user** on the minimal backend exception (never a silent backend edit; backend is otherwise frozen).
- **Depends on:** Bolt 1 (needs a session to probe writes).
- **Exit criteria:** every v1 write has a confirmed mobile-callable path or an explicit, user-approved plan; Bolts 3–5 can build forms without re-discovering blockers.

## Bolt 3 — Onboarding
- **Goal:** the profile-completion gate.
- **Stories:** US-O1…US-O4.
- **Depends on:** Bolt 1 (session) + Bolt 2 (nickname/complete write paths).
- **Exit criteria:** a fresh account is forced through onboarding and lands in the tabs with a complete profile; default-avatar selection works.

## Bolt 4 — Matches & Predictions
- **Goal:** fixture browsing + predictions.
- **Stories:** US-M1…US-M5.
- **Key ADRs:** fixture read shape + day-grouping in device tz; `savePrediction` write path (from Bolt 2); cache invalidation strategy.
- **Depends on:** Bolt 0 (data layer) + Bolt 1 + Bolt 2.
- **Exit criteria:** predictions submit/lock correctly and results/points display; lists are smooth (FlashList).

## Bolt 5 — Pools
- **Goal:** full pool lifecycle incl. deep-link join.
- **Stories:** US-P1…US-P6.
- **Key ADRs:** owner-only mutation paths + capacity/duplicate handling (from Bolt 2); parked-deep-link-join flow.
- **Depends on:** Bolt 0 + Bolt 1 + Bolt 2 (this unit owns the densest class-3 surface).
- **Exit criteria:** create/discover/join(public + token + deep link)/leave/kick/delete all work with server-enforced rules surfaced as errors.

## Bolt 6 — Leaderboard & Rankings
- **Goal:** global + per-pool standings (read-only).
- **Stories:** US-L1…US-L3.
- **Key ADRs:** live-projection query availability (class-3 check from Bolt 2).
- **Depends on:** Bolt 4 (scores) + Bolt 5 (pool context).
- **Exit criteria:** global and pool leaderboards render correct server-computed standings with focus refetch.

---

## Cross-bolt notes
- **Topology:** all bolts compile into the single host bundle. No `/repack-init` / Module Federation unless the single-bundle decision is reversed (see `system-context.md` §2 remote-candidate table).
- **Testing (every bolt):** RNTL for components/flows; `agent-device` E2E focused on auth, deep-link pool-join, and prediction submit.
- **Each bolt** gets its own `memory-bank/bolts/{bolt-id}/` with ADRs (`adr-NNN.md`) per `memory-bank/standards/system-architecture.md`.
- **Deferred to v2 (not in any v1 bolt):** Settings (profile/security), push notifications, custom avatar upload, Passkeys, MFA, directed invites, biometrics, realtime score push, Admin.
