# Bolt 0 — Stage 1: Model

> Ubiquitous language + domain abstractions for the app shell. Bolt 0 ships no feature domain; it models the **session lifecycle, navigation state machine, and deep-link intents** every later unit depends on. Traces to `intents/001-mobile-v1-migration/system-context.md` §3–§5.

## Ubiquitous language
- **Session** — authenticated state derived from Supabase: `{ userId, email, emailVerified, accessToken, refreshToken, expiresAt }`. Persisted in secure storage; hydrated at boot.
- **AuthStatus** — `unknown | unauthenticated | unverified | authenticated`.
- **Profile gate flag** — `onboardingCompleted: boolean` read from the user's profile; decides Onboarding vs Ready.
- **AppRoute phase** — the top-level destination the shell shows: `Booting | Auth | Onboarding | App`.
- **DeepLinkIntent** — a parsed `betmeet://` action the app must perform, possibly **parked** until auth/onboarding finish.
- **Data layer** — the client read/cache/invalidate abstraction (feature units consume it; Bolt 0 only stands it up).

## Domain abstractions (framework-light, testable)
### 1. Navigation state machine — `resolveAppPhase(input) → AppRoute`
Pure function (no I/O) so it's unit-testable independent of navigation/Supabase.
```
input  = { authStatus: AuthStatus, onboardingCompleted: boolean | null }
output = AppRoute

unknown                              → Booting
unauthenticated                      → Auth
unverified                           → Auth   (verify-email gate within Auth stack)
authenticated & onboardingCompleted? → App
authenticated & !onboardingCompleted → Onboarding
authenticated & onboarding unknown   → Booting (still loading profile)
```
Mirrors `system-context.md` §3. Transitions are driven by session/profile changes, never imperative navigation calls.

### 2. Session lifecycle
- **hydrate()** — read persisted session at boot → `unknown`→resolved status.
- **observe** — subscribe to Supabase auth changes → update `Session` + `AuthStatus`.
- **refresh** — silent token refresh on expiry (delegated to Supabase client config).
- **clear()** — sign-out wipes secure storage + ends Supabase session → `unauthenticated`.
Bolt 0 implements hydrate/observe/clear plumbing; **actual sign-in/up lives in Bolt 1 (Auth)**.

### 3. Deep-link intent model — `parseDeepLink(url) → DeepLinkIntent | null`
Pure parser. Recognized intents (from `system-context.md` §4):
```
betmeet://auth/confirm?token_hash&type   → { kind: 'authConfirm', tokenHash, type }
betmeet://auth/reset?token_hash          → { kind: 'authReset', tokenHash }
betmeet://pools/join/:token              → { kind: 'poolJoin', token }       (parkable)
```
- **Parkable intents** (`poolJoin`) are stored when `authStatus !== authenticated || !onboardingCompleted`, then replayed once phase becomes `App`.
- Unknown URLs → `null` (ignored, no crash).

## Invariants
- The shell **never** lands a user in `App` without an authenticated, verified, onboarded session.
- A parked intent is replayed **exactly once** and then cleared.
- No secret/token is ever written outside secure storage (NFR-5).
- `resolveAppPhase` and `parseDeepLink` are **pure** — they're the unit-test surface for this bolt.

## Out of model (later bolts)
- Concrete auth credentials/flows → Bolt 1. Profile/nickname domain → Bolt 3. Feature entities (Match/Pool/etc.) → their bolts.
