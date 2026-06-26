# Bolt 1 — Stage 2: Design

> Builds the Auth unit on top of Bolt 0. Host bundle. Implements the Stage-1 model. Library choices locked at the Design checkpoint → `adr/`.

## Locked choices
| Concern | Choice | ADR |
|---|---|---|
| Forms + validation | **react-hook-form + zod** (`@hookform/resolvers`) | ADR-005 |
| Google OAuth | **System browser via `Linking`** (`signInWithOAuth({skipBrowserRedirect})` → openURL → deep-link return) — no new native dep | ADR-006 |
| Supabase auth flow | **PKCE** (`flowType: 'pkce'`) for mobile OAuth/recovery | ADR-006 |
| Styling | Plain `StyleSheet` + small shared inputs/buttons (consistent with Bolt 0) | — |

## Dependencies to add
`react-hook-form`, `zod`, `@hookform/resolvers` — all pure JS, **no native rebuild needed**.

## Bolt 0 touch-points (small, additive)
1. **`supabaseClient.ts`** — add `auth.flowType: 'pkce'` (keep `detectSessionInUrl:false`, secure storage).
2. **`domain/deepLink.ts`** — add an `authCallback` intent for OAuth return:
   `betmeet://auth/callback?code=…` → `{ kind: 'authCallback', code }`. (`auth/confirm`, `auth/reset`, `pools/join` unchanged.)
3. **`app/deepLinks.ts`** — route `authConfirm`/`authReset`/`authCallback` to the auth handlers (still parking `poolJoin`).
4. **`useSessionBootstrap.ts`** — on `authenticated`, call `fetchOnboardingCompleted(userId)` and `setOnboardingCompleted(...)` (closes the Bolt 0 TODO → resolves `Booting`).

## New structure (`src/auth/`)
```
src/auth/
├── validation.ts          # zod schemas: signUpSchema, signInSchema, forgotSchema,
│                          #   resetPasswordSchema (realize the model's pure validators)
├── authErrors.ts          # mapAuthError(raw) → AuthError {kind, messageKey}
├── authService.ts         # AuthService impl over supabase.auth (model's contract)
├── googleOAuth.ts         # signInWithGoogle(): build URL, openURL, await deep-link, exchange
├── profileGate.ts         # fetchOnboardingCompleted(userId) (defensive; see below)
├── useAuthForm.ts         # RHF + zodResolver helper shared by the forms
└── screens/
    ├── SignInScreen.tsx
    ├── SignUpScreen.tsx
    ├── ForgotPasswordScreen.tsx
    ├── ResetPasswordScreen.tsx
    └── VerifyEmailScreen.tsx
src/ui/
├── TextField.tsx          # labeled input + error text (i18n message-key)
└── Button.tsx             # primary/secondary, loading state
```
`AuthStack.tsx` swaps its placeholders for these real screens (route names/params unchanged from Bolt 0 `navigation/types.ts`).

## Validation (RHF + zod)
- zod schemas are the canonical, pure, testable validators (replace the model's `validateX` signatures — same intent, expressed as schemas). Messages are **i18n message-keys**, resolved in the component via `t()`.
- Each screen: `useForm({ resolver: zodResolver(schema) })`; submit disabled while invalid/submitting.

## Auth flows (FR-A1…A7)
- **Sign up** → `supabase.auth.signUp` → success shows "check your email" (NO session; unverified gate). 
- **Verify email** (deep link `authConfirm`) → `verifyOtp({ type, token_hash })` → session becomes verified → nav advances. VerifyEmailScreen also offers **resend**.
- **Sign in** → `signInWithPassword` → session (Bolt 0 store updates via `onAuthStateChange`).
- **Google** (ADR-006) → `signInWithOAuth({ provider:'google', options:{ redirectTo:'betmeet://auth/callback', skipBrowserRedirect:true } })` → `Linking.openURL(url)` → return `authCallback` → `exchangeCodeForSession(code)` → session.
- **Forgot** → `resetPasswordForEmail(email, { redirectTo:'betmeet://auth/reset' })`.
- **Reset** (deep link `authReset`) → `verifyOtp({ type:'recovery', token_hash })` to get a recovery session → ResetPasswordScreen → `updateUser({ password })` → route to SignIn.
- **Sign out** → `supabase.auth.signOut()` + store `clear()` (secure storage cleared by adapter).

## Profile gate (defensive — closes Bolt 0 TODO)
`fetchOnboardingCompleted(userId)`:
- Reads the profile row's onboarding flag via PostgREST. **Exact table/column names are confirmed in Bolt 2 (write-path audit)**; until then a constant (`PROFILE_TABLE`, `ONBOARDING_COL`) centralizes them.
- **On any error or missing row → return `false`** (→ Onboarding). This guarantees an authenticated user never gets stuck at `Booting` even if schema names need adjustment. Safe because Onboarding is a placeholder until Bolt 3.

## Error & i18n
- All failures pass through `mapAuthError` → `{kind, messageKey}`; screens render `t()[messageKey]`. New i18n keys added under `auth.*` in `es`/`en` dictionaries.

## Backend config the user must set (Supabase dashboard)
- **Redirect URLs**: add `betmeet://auth/callback`, `betmeet://auth/reset`, `betmeet://auth/confirm` to Auth → URL Configuration (Redirect URLs / additional redirect allow-list).
- **Google provider** enabled in Supabase Auth (web already uses it, so likely set).
- Flagged as a verification step (not a code task) since the backend is frozen/owned elsewhere.

## Test surface (Stage 5 preview)
- Unit: zod schemas (valid/invalid for each form), `mapAuthError` table, `parseDeepLink` new `authCallback` case, `fetchOnboardingCompleted` error→false fallback (mocked client).
- Component (RNTL): SignIn renders, validates, calls `AuthService.signIn` (service mocked); VerifyEmail resend; ResetPassword submit.
- Device (`agent-device`): boot → SignUp → (manual email confirm) → SignIn → land on Onboarding placeholder; plus the deferred Bolt 0 boot/deep-link smoke.
