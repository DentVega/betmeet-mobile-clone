# Web → Mobile Migration Parity Matrix

> Migration-only gap check: did mobile silently drop web features? Source surface: `../betmeet-clone/src/app` (Next.js App Router). Target: `betmeet-mobile-clone/src/**`. Generated via `/parity`.

## Matrix

| Web surface (route) | Mobile equivalent | Status |
|---|---|---|
| Landing / marketing — `page.tsx` (`/`) | none | OUT-OF-SCOPE (web-only marketing funnel; no native public entry) |
| Sign in — `(auth)/sign-in` | `auth/screens/SignInScreen` | COVERED |
| Sign up — `(auth)/sign-up` | `auth/screens/SignUpScreen` | COVERED |
| Forgot password — `(auth)/forgot-password` | `auth/screens/ForgotPasswordScreen` | COVERED |
| Reset password — `(auth)/reset-password` | `auth/screens/ResetPasswordScreen` | COVERED |
| Verify email — `(auth)/verify-email` | `auth/screens/VerifyEmailScreen` | COVERED |
| OAuth callback — `auth/callback/route.ts` | deep link `betmeet://auth/callback` | OUT-OF-SCOPE (Next route handler → deep link) |
| Email confirm — `auth/confirm/route.ts` | deep link `betmeet://auth/confirm` | OUT-OF-SCOPE (Next route handler → deep link) |
| Onboarding — `onboarding/profile` | `onboarding/screens/{Nickname,Avatar,Rules}Screen` | COVERED |
| Matches — `(app)/matches` | `matches/screens/MatchesScreen` | COVERED |
| Pools list — `(app)/pools` | `pools/screens/PoolsListScreen` | COVERED |
| Pools discover — `(app)/pools/discover` | `pools/screens/PoolDiscoverScreen` | COVERED |
| Create pool — `(app)/pools/new` | `pools/screens/PoolNewScreen` | COVERED |
| Pool detail — `(app)/pools/[id]` | `pools/screens/PoolDetailScreen` (+ PoolPredictions/PoolSettings/PoolInvite) | COVERED |
| Pool leaderboard — `(app)/pools/[id]/leaderboard` | `leaderboard/screens/PoolLeaderboardScreen` | COVERED |
| Join by token — `(app)/pools/join/[token]` | `pools/screens/PoolJoinScreen` + deep link | COVERED |
| Rankings — `(app)/rankings` | `leaderboard/screens/RankingsScreen` | COVERED |
| Rules center — `(app)/rules` (text) | `education/RulesScreen` + `rulesContent.ts` | COVERED |
| ↳ Interactive scoring calculator + score-breakdown demo (embedded in rules) | `education/ScoreCalculator.tsx` + `scoring.ts` (Intent 007) | COVERED |
| Settings / profile — `(app)/settings/profile` | `settings/screens/ProfileScreen` | COVERED |
| ↳ Custom avatar upload (in profile) | placeholder only | DEFERRED (V8 — RN 0.86 image-picker; backend ready) |
| Settings / security — `(app)/settings/security` | `settings/screens/SecurityScreen` | COVERED |
| ↳ Passkeys (in security) | `auth/passkeys.ts` + Security screen | DEFERRED (V9 — code-complete, activation-pending: RP domain) |
| Admin dashboard/sync — `(app)/admin` | none | OUT-OF-SCOPE (Intent 002 excludes full admin + live sync) |
| Admin force results — `(app)/admin/matches` | `enter-result` Edge Function (no UI) | OUT-OF-SCOPE (admin UI excluded; server-side result entry only) |
| API routes — `api/{email-hook,cron/sync,csp-report,notifications/dispatch}` | Supabase Edge Functions | OUT-OF-SCOPE (Next server infra → Edge Functions) |

## Summary
- **COVERED: 17**
- **DEFERRED: 2** (avatar upload V8, passkeys V9 — both tracked in progress.md + ACTIVATION.md)
- **MISSING: 0** ✅ (calculator implemented — Intent 007)
- **OUT-OF-SCOPE: 6** (marketing landing, 2 auth route handlers → deep links, admin ×2, Next API infra)

## MISSING — none
The one gap (interactive scoring calculator) was **implemented** in Intent 007 (`education/ScoreCalculator.tsx`, in the Rules tab). Parity is complete for all user-facing web surfaces (excluding intentionally out-of-scope marketing/admin/Next-infra).

## Notes
- DEFERRED rows are tracked, not silent (progress.md + ACTIVATION.md have reactivation steps). Push (V10) is backend-only (no web user-facing screen).
- Marketing landing left OUT-OF-SCOPE (no native public entry); revisit only if a mobile intro/marketing screen becomes desired.
