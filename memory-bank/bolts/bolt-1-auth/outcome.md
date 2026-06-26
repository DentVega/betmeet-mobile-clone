# Bolt 1 — Auth — Outcome

- **Status:** ✅ Complete (code); device E2E pending backend config (below)
- **Intent:** 001-mobile-v1-migration
- **DDD stages:** Model → Design → ADR-005/006 → Implement → Test (checkpoints approved)
- **Stories:** US-A1…A6

## What shipped
Full v1 auth surface against the existing Supabase project, host bundle:
- **Screens** (replace Bolt 0 placeholders): SignIn, SignUp, ForgotPassword, ResetPassword, VerifyEmail — react-hook-form + zod (ADR-005), shared `TextField`/`Button`.
- **`AuthService`** over `supabase.auth`: signUp, signIn, requestPasswordReset, confirmEmail, resendConfirmation, beginPasswordRecovery, completePasswordReset, signOut. Screens never call `supabase` directly.
- **Google OAuth** via system browser + `Linking` (ADR-006), PKCE flow; `exchangeCodeForSession` on the `authCallback` deep link.
- **Deep links** extended: new `authCallback` intent; `authConfirm`→VerifyEmail (auto-verify), `authReset`→ResetPassword (recovery session).
- **Profile gate** closed (Bolt 0 TODO): `fetchOnboardingCompleted` wired into `useSessionBootstrap`; defensive `false` on error/missing → never stuck at Booting.
- **Sign out** (US-A6) from the app-shell header.
- **i18n**: `auth.*` keys (es/en) + `tr()` dotted-key resolver; error mapping via `mapAuthError`.

## Files
- New: `src/auth/**` (service, validation, errors, googleOAuth, profileGate, SignOutButton, 5 screens + styles), `src/ui/{TextField,Button}.tsx`, 3 test suites.
- Edited (Bolt 0 touch-points): `supabaseClient` (PKCE), `domain/deepLink` (+authCallback), `app/deepLinks` (route authCallback), `useSessionBootstrap` (gate), `AuthStack` (real screens), `AppTabs` (sign-out), `navigation/types` (VerifyEmail email param), i18n dictionaries.
- Deps: react-hook-form, zod, @hookform/resolvers (pure JS, no native rebuild).

## ADRs
ADR-005 (react-hook-form + zod) · ADR-006 (Google OAuth system browser + PKCE).

## Verification
- `tsc --noEmit` clean · `jest` 43/43 (22 new) · Rspack android bundle exit 0.

## Required before device E2E (NOT code — backend config)
1. Supabase dashboard → Auth → URL Configuration: allow-list `betmeet://auth/callback`, `betmeet://auth/reset`, `betmeet://auth/confirm`.
2. Google provider enabled in Supabase Auth.
3. Restart dev server so DefinePlugin injects real `.env` creds; rebuild app.

## Carried forward
- **Profile table/column names** (`Profile`/`onboardingCompleted`) to confirm in Bolt 2 (write-path audit). Defensive fallback active until then.
- **Screen-level RNTL tests** deferred (logic covered at pure layer); add after device smoke.
- Deferred Bolt 0 device boot/deep-link smoke folds into Bolt 1's device check.
- OAuth cold-start deep link (app not running) not handled — OAuth is initiated warm; acceptable for v1.

## Next
Bolt 2 — Write-Path Audit (the server-action-vs-callable-API spike that de-risks Onboarding/Predictions/Pools), per `bolt-plan.md`.
