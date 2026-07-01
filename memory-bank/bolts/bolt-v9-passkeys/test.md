# Bolt V9 — Test (Passkeys)

## Probe (native build) — PASS
`react-native-passkey@3.5.0` clean Android rebuild: BUILD SUCCESSFUL; autolinking includes "Passkey". Runtime: SecurityScreen mounts the module without a null-module crash (contrast: image-picker in V8 was null). → native lib viable on RN 0.86.

## Static
- tsc clean; jest 54/54.

## Device
- SecurityScreen renders cleanly with react-native-passkey linked+loaded; no JS errors.
- Passkeys section hidden while PASSKEY_RP_ID unset (graceful gate).

## NOT verifiable here (activation-pending)
- The register ceremony end-to-end (enroll→challenge→Passkey.create→verify) needs the RP domain + assetlinks.json + Supabase WebAuthn config — no RP domain available.
- The hand-written ArrayBuffer→JSON option re-serialization is unverified against a real challenge.
- Passwordless passkey sign-in (deferred).
