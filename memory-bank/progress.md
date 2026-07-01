# Progress

> **Agent note:** This is your long-term progress tracker. Update it whenever you complete a Bolt, close a phase, or reach a major milestone.

## Overall Status
- **🏁 v1 FEATURE-COMPLETE — all 10 bolts (0–9) done.** Construction complete.
- **Bolts Completed:** 10 / 10 (Intent 001). Remaining = activation (apply to live Supabase + native rebuild) + device E2E, not new features.

## Intent 002 — v2 full web parity (Inception done)
- **Inception COMPLETE** (`intents/002-v2-web-parity/`): requirements, system-context, 8 unit briefs, 33 stories, 10-bolt plan — all checkpoints approved. Verified via a Units 1–72 web-vs-mobile gap analysis.
- Scope: full parity; 3 native modules (image picker, passkeys/biometrics, push); auto-scoring + minimal result-entry (no live football-data sync, no full admin); single bundle.
- Bolts (Planned): V1 i18n ✅ · V2 Settings+Profile ✅ · V3 Results&Auto-scoring ✅ · V4 Realtime&Live ✅ · V5 Pool-Depth backend ✅ · V6 Pool-Depth mobile ✅ · V7 Account&Security ✅ · V8 Avatar upload (native) ⛔deferred(RN0.86) · V9 Passkeys (native) ✅code-complete/⏳activation · V10 Notifications/push (native). **V7 done · V8 deferred · V9 code-complete (activation-pending) → Next: V10.**

## Post-v1
- **Bolt 10 — Design Parity:** `Completed` — deportivo theme (light/dark) + themed primitives + all screens restyled + flags/avatars (react-native-svg, native rebuilt). Verified on device. Follow-ups: embed Barlow/Geist fonts; iOS `pod install`; moderno/premium themes. See `bolts/bolt-10-design-parity/`.

## Activation checklist (to run the full app)
1. ✅ DONE — `supabase db push`: all **13/13 migrations** applied to remote (incl. V2 cooldown + V3 auto_scoring + V4 live_projection).
2. ✅ DONE — `functions deploy`: **11/11 Edge Functions** ACTIVE (+ V7 `delete-account`; V3 `enter-result`/V4 status; `set-nickname` RATE_LIMITED); ADMIN_SECRET set.
3. ⬜ Native rebuild for FlashList: `bundle exec pod install --project-directory=ios` + `npm run android`/`ios`.
4. ⬜ Dashboard: Auth redirect URLs `betmeet://auth/{callback,reset,confirm}` + public `avatars` bucket (upload defaults/01–06.png).
5. ⬜ (Optional) invoke `compute-score` on the 3 seeded FINISHED matches to populate scores/leaderboard.

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
- **Bolt 7 — Matches & Predictions:** `Completed` — Matches tab (FlashList day-grouped) + PredictionForm via save-prediction; fixture.ts pure (group/past/canEdit). tsc/jest 51 ✓/bundle green. **FlashList native → rebuild.** See `bolts/bolt-7-predictions/`.
- **Bolt 8 — Pools:** `Completed` — 5 screens (list/new/discover/detail/join) + leave/kick/delete fns + fn_discover_pools RPC + deep-link join. tsc/jest 51/bundle green; fns validated on PG17. **User: `db push` + `functions deploy leave-pool kick-member delete-pool`.** See `bolts/bolt-8-pools/`.
- **Bolt 9 — Leaderboard & Rankings:** `Completed` — global ranking + per-pool leaderboard via fn_global_ranking/fn_pool_leaderboard RPCs; RankingsScreen + PoolLeaderboardScreen. tsc/jest 51/bundle green; RPCs validated on PG17. See `bolts/bolt-9-leaderboard/`.

## Deferred or Blocked Tasks
- **Phase C mobile write bolts** — blocked until Phase B (backend minimum) exists.
- **Module Federation setup** — deferred (single-bundle). Run `/repack-init` only if on-demand chunking is needed.
- **Deferred to v2:** live football-data.org sync, push notifications, email, custom avatar upload, Settings, Passkeys, MFA, biometrics, Admin.
