# Bolt 1 — Stage 1: Model

> Auth domain for v1: email/password + Google OAuth + email verification + password reset (Passkeys/MFA deferred). Traces to `intents/001-mobile-v1-migration/units/auth/` (US-A1…A6) and `system-context.md` §5–§6. Builds on Bolt 0 (session store, secure storage, deep-link parsing, nav state machine).

## Ubiquitous language
- **Credentials** — `{ email, password }` entered by the user.
- **AuthResult** — outcome of an auth operation: `ok` (session established / email sent) or `failure` (typed `AuthError`).
- **AuthError** — a *domain* error category mapped from Supabase errors, not a raw message. Kinds: `invalidCredentials | emailNotConfirmed | emailAlreadyInUse | weakPassword | rateLimited | network | unknown`.
- **OAuthProvider** — v1: `google`.
- **VerificationState** — whether the signed-in user's email is confirmed (drives the unverified gate, Bolt 0 `AuthStatus='unverified'`).
- **ProfileGate** — `onboardingCompleted` fetched for the authenticated user; resolves Bolt 0's `Booting`→`App`/`Onboarding` decision.

## Pure domain (the unit-test surface)
Framework-free, no Supabase — these are what Stage 5 tests directly.

### 1. Credential validation — mirrors web zod rules (FR-A1)
```
validateEmail(email)            → boolean            // RFC-ish, trimmed, non-empty
validatePassword(password)      → boolean            // length ≥ 8 (web FR-REFINE-15.12)
validateSignUp({email,password,confirm})
                                → FieldErrors         // { email?, password?, confirm? }
validateSignIn({email,password})→ FieldErrors
```
`FieldErrors` is an object keyed by field → message-key (i18n key, not literal copy). Empty object = valid. Submit is enabled only when there are no errors.

### 2. Error mapping — `mapAuthError(raw) → AuthError`
Pure function translating a Supabase error (status/code/message) into an `AuthError` kind + i18n message-key. Centralizes the only place that touches raw provider strings, so screens render localized, stable messages. Examples: `400 invalid_credentials → invalidCredentials`; `email_not_confirmed → emailNotConfirmed`; `422 weak_password → weakPassword`; `429 → rateLimited`; fetch failure → `network`.

## Operations contract (effectful — `AuthService`)
Thin interface over `supabase.auth` (Bolt 0 client). Implementation in Implement; the contract is the design boundary.
```
signUp(creds)                  → AuthResult   // sends verification email (FR-A1)
signIn(creds)                  → AuthResult   // password grant (FR-A3)
signInWithGoogle()             → AuthResult   // system-browser OAuth + deep-link return (FR-A4)
requestPasswordReset(email)    → AuthResult   // sends reset email (FR-A5)
confirmEmail(tokenHash,type)   → AuthResult   // verifyOtp from authConfirm deep link (FR-A2)
completePasswordReset(newPwd)  → AuthResult   // updateUser after reset deep link (FR-A5)
signOut()                      → void         // clears Supabase + secure storage (FR-A6)
```
Session persistence, refresh, and `onAuthStateChange` are already owned by Bolt 0 (`supabaseClient` + `useSessionBootstrap`); Auth screens never write tokens directly.

## Profile gate resolution (closes Bolt 0 TODO)
- `fetchOnboardingCompleted(userId) → boolean | null` — reads the user's `Profile.onboardingCompleted` (PostgREST select). Wired into the auth-state subscription so that on `authenticated`, the store's `onboardingCompleted` is set, letting `resolveAppPhase` move `Booting → App | Onboarding`.
- **Write-path note:** this is a *read*; if the profile row doesn't exist yet for a brand-new user, treat as `false` (→ Onboarding). Confirmed against the write-path audit (Bolt 2) for the profile table read access under RLS.

## Deep-link consumption (built on Bolt 0)
- `authConfirm` intent → `confirmEmail(tokenHash, type)` → on success the session becomes verified → nav advances.
- `authReset` intent → route to ResetPassword screen → `completePasswordReset(newPwd)`.
- `poolJoin` parking is unchanged (Bolt 0); after auth+onboarding it replays.

## Invariants
- Screens depend on `AuthService` + pure validators only — never call `supabase` directly (testable, swappable).
- No raw provider error reaches the UI; everything passes through `mapAuthError`.
- Tokens are written only by the Bolt 0 secure-storage adapter (unchanged).
- A successful sign-up does **not** create a session — it requires email confirmation first (unverified gate, FR-A7).

## Out of model (later)
- Passkeys/MFA (v2). Account deletion / email change / linked providers → Settings (v2). Onboarding wizard UI → Bolt 3 (this bolt only *reads* the gate).
