# Bolt V9 — Passkeys (native) — Outcome: ✅ code-complete, ⏳ activation-pending

- **Status:** ✅ **Code-complete + gated** (native lib builds & loads; register flow implemented). ⏳ **End-to-end unverifiable here** — needs RP-domain infra.
- **Intent:** 002-v2-web-parity · unit `account-security` (FR-AS5) · Story US-AS5
- **DDD:** Model → Design+ADR-024 → Implement → Test (probe-first)

## Probe result (the key finding)
Unlike image-picker, **`react-native-passkey@3.5.0` builds on RN 0.86** (autolinking OK, clean rebuild SUCCESSFUL) **and loads at runtime** (SecurityScreen renders with the module present — no null-module crash). So passkeys are viable on this stack.

## What shipped
- **`src/auth/passkeys.ts`** — `passkeysAvailable()` (gate: `ENV.PASSKEY_RP_ID` + `Passkey.isSupported()`) + `registerPasskey()`: `mfa.enroll(webauthn)` → `mfa.challenge` → **re-serialize** Supabase's deserialized (ArrayBuffer) options back to base64url JSON → `Passkey.create` (biometric) → `mfa.verify(type:'create')`.
- **SecurityScreen** — a **Passkeys** section (register button) shown only when `passkeysAvailable()`.
- **Config** — `PASSKEY_RP_ID` via env.ts + rspack DefinePlugin; documented in `.env.example`.
- i18n `security.passkeys/registerPasskey/passkeyRegistered`.
- List/delete of passkey factors reuses V7's `mfa.listFactors`/`unenroll`.

## ADR
ADR-024 — bridge react-native-passkey ↔ Supabase MFA WebAuthn; gate on a configurable RP (no hard-coded domain) so the UI degrades gracefully when unconfigured.

## Honest caveats (why "activation-pending")
1. **RP-domain infra required**: Android needs `https://{PASSKEY_RP_ID}/.well-known/assetlinks.json` listing the app's signing SHA-256; iOS needs an `apple-app-site-association` + associated-domains entitlement + `pod install`. Plus Supabase WebAuthn RP config.
2. **DOM-serialization impedance**: Supabase's WebAuthn is DOM-first (`navigator.credentials`); `mfa.challenge` returns ArrayBuffer options. The bridge re-serializes them to JSON by hand — **unverified** without the RP domain to run a real ceremony.
3. **Passwordless sign-in deferred**: only *register* (add a passkey to an account) is implemented; passwordless passkey **sign-in** (primary auth) is the most DOM-coupled path and was deferred until the register flow is verified against real infra.

## Verification
tsc/jest 54/54. Device: SecurityScreen renders with `react-native-passkey` linked+loaded (no crash); Passkeys section correctly hidden while `PASSKEY_RP_ID` is unset (graceful degradation).

## Activation checklist (user-provisioned)
1. A domain you control as the RP; host `/.well-known/assetlinks.json` (Android SHA-256) [+ AASA for iOS].
2. Configure Supabase WebAuthn RP (rpId/origins) + enable the webauthn factor.
3. Set `PASSKEY_RP_ID` in `.env` → rebuild.
4. Verify register on device; then implement + verify passwordless sign-in.

## Next
Bolt V10 — Notifications (push, native) — probe FCM/APNs lib build first, then implement + document activation.
