# Progress

> **Agent note:** This is your long-term progress tracker. Update it whenever you complete a Bolt, close a phase, or reach a major milestone.

## Overall Status
- **Current Phase:** Construction — Phase C (mobile features) in progress
- **Bolts Completed:** 7 / 9 (Intent 001) — Onboarding done; **Bolt 7 (Matches & Predictions) next**

## Milestones Achieved
- [x] Memory Bank and standards initialized
- [x] First intent captured — **Intent 001: Betmeet Mobile v1** (`intents/001-mobile-v1-migration/`)
- [x] Requirements, system-context, 5 unit briefs, 24 stories, and bolt plan validated (all 5 Inception checkpoints approved)
- [ ] Bolt 0 (Foundations & App Shell) complete

## Bolts (Execution Units) — Intent 001
- **Bolt 0 — Foundations & App Shell:** `Completed` — RN Navigation v7 shell, Supabase+keychain session, TanStack Query+Zustand, betmeet:// deep links, i18n. 21 tests, bundle green. See `bolts/bolt-0-foundations/`.
- **Bolt 1 — Auth:** `Completed` — 5 screens (RHF+zod), AuthService, Google OAuth (system browser+PKCE), deep-link verify/reset/callback, profile-gate closed, sign-out. 43 tests, bundle green. Device E2E pending Supabase redirect-URL config. See `bolts/bolt-1-auth/`.
- **Bolt 2 — Write-Path Audit (spike/ADR):** `Completed` — ADR-007: betmeet-clone backend not mobile-callable → build own Supabase backend (RLS + Edge Functions). See `bolts/bolt-2-write-path-audit/`.
- _Phase B — own backend (NEW):_
- **Bolt 3 — Backend: Core schema + RLS:** `Completed (SQL ready)` — `supabase/` with 10 tables, 16 RLS policies, triggers (profile auto-create, lock guard); validated on ephemeral PG17. **User runs `supabase db push`** to apply. See `bolts/bolt-3-backend-schema/`.
- **Bolt 4 — Backend: Edge Functions:** `Completed (code ready)` — 4 Deno functions + atomic plpgsql (fn_save_prediction/create_pool/join_pool); scoring ported; validated on ephemeral PG17 (lock/capacity/idempotent/NAME_TAKEN all pass; 1 bug fixed). **User runs `db push` + `functions deploy` + `secrets set ADMIN_SECRET`.** See `bolts/bolt-4-edge-functions/`.
- **Bolt 5 — Backend: Match seed:** `Completed (SQL ready)` — idempotent dev fixture: 1 competition, 5 phases, 16 teams, 14 matches (3 FINISHED). Validated on PG17. Applies via `db push`. See `bolts/bolt-5-match-seed/`.
- _Phase C — mobile features (blocked on Phase B):_
- **Bolt 6 — Onboarding:** `Completed` — wizard (nickname/avatar/rules) + fn_set_nickname + set-nickname Edge Function; gate flips on complete. tsc/jest/bundle green; fn validated on PG17. **User: `db push` + `functions deploy set-nickname`.** See `bolts/bolt-6-onboarding/`.
- **Bolt 7 — Matches & Predictions:** `Planned` — US-M1…M5.
- **Bolt 8 — Pools:** `Planned` — US-P1…P6.
- **Bolt 9 — Leaderboard & Rankings:** `Planned` — US-L1…L3.

## Deferred or Blocked Tasks
- **Phase C mobile write bolts** — blocked until Phase B (backend minimum) exists.
- **Module Federation setup** — deferred (single-bundle). Run `/repack-init` only if on-demand chunking is needed.
- **Deferred to v2:** live football-data.org sync, push notifications, email, custom avatar upload, Settings, Passkeys, MFA, biometrics, Admin.
