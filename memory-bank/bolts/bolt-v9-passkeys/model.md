# Bolt V9 — Stage 1: Model (Passkeys — native)

> Intent 002 · unit `account-security` (FR-AS5). Probe-first result: **`react-native-passkey@3.5.0` BUILDS on RN 0.86** (autolinking OK, clean rebuild SUCCESSFUL) — unlike image-picker. The remaining blocker is **infra**, not the build.

## Probe outcome
- ✅ Native lib links + app rebuilds clean (New-Arch codegen OK for this lib).
- ✅ Supabase auth-js 2.108 supports WebAuthn as an MFA factor (`FactorTypes=['totp','phone','webauthn']`): `mfa.enroll({factorType:'webauthn'})` → `mfa.challenge({factorId, webauthn:{rpId,rpOrigins}})` → `mfa.verify({factorId, challengeId, webauthn:{rpId, type:'create'|'request', credential_response}})`. Its built-in helpers use `navigator.credentials` (DOM) — on RN we bridge via `react-native-passkey`.

## Hard infra dependency (activation, not code)
Android passkeys require **Digital Asset Links**: `https://{rpId}/.well-known/assetlinks.json` listing the app's signing SHA-256, on a domain you control (the WebAuthn **Relying Party**). Plus Supabase WebAuthn RP config (rpId/origins). Without these, `Passkey.create/get` fails at the OS level. → **End-to-end passkeys are untestable here** (no RP domain); this bolt ships **code-complete, activation-pending** (like push will be).

## Ubiquitous language
- **Register passkey** — `mfa.enroll({factorType:'webauthn'})` → `mfa.challenge(...)` → `Passkey.create(options)` (biometric) → `mfa.verify({...type:'create', credential_response})` → verified factor.
- **Sign in with passkey** — `mfa.challenge`/`mfa.verify({type:'request'})` bridged through `Passkey.get(options)`.
- **List / delete** — reuse `mfa.listFactors()` (webauthn factors) / `mfa.unenroll` (already in `securityApi`).
- **RP config** — `rpId` + `rpOrigins` read from env (`PASSKEY_RP_ID`), so no hard-coded domain.

## Deliverables
1. **`src/auth/passkeys.ts`** — `registerPasskey()` + `signInWithPasskey(email?)` bridging `react-native-passkey` ↔ Supabase MFA webauthn (map option/response JSON shapes). Guarded: returns `{ok:false, code:'NOT_CONFIGURED'}` when `PASSKEY_RP_ID` is unset.
2. **SecurityScreen** — a "Passkeys" section: register (biometric) + list/delete webauthn factors (extends the MFA/providers area).
3. **SignInScreen** — a "Sign in with passkey" button (visible when configured).
4. **Config** — `PASSKEY_RP_ID`/origins via the existing env/DefinePlugin; `.env.example` note.
5. Native: Android needs `assetlinks.json` at the RP domain (documented) — no manifest change beyond what autolink provides.

## Invariants
- The passkey ceremony is bridged, never re-implemented; Supabase verifies server-side.
- No hard-coded RP domain — gated on `PASSKEY_RP_ID` so the app degrades gracefully when unconfigured.
- Min-one-auth-method guard (from V7) still applies to deleting a passkey.

## Out of model (activation, user-provisioned)
Hosting `assetlinks.json` at the RP domain; Supabase WebAuthn RP settings; iOS associated-domains (`apple-app-site-association`) + `pod install`. End-to-end device test (needs the above).
