# Bolt V7 — Account & Security (non-native) — Outcome

- **Status:** ✅ Complete (tsc/jest clean; transfer logic on PG; SecurityScreen verified on device; delete-account deployed)
- **Intent:** 002-v2-web-parity · unit `account-security` (non-native) · Stories US-AS1/AS2/AS3/AS4/AS6
- **DDD:** Model → Design+ADR-022 → Implement → Test (checkpoints approved)

## What shipped
- **`authService`** += `changeEmail` (updateUser → confirm via existing email_change deep link), `changePassword` (reauth with current password → updateUser).
- **`googleOAuth`** += `linkGoogle` (linkIdentity + browser flow, reuses auth/callback).
- **`securityApi`** — MFA (listFactors/enrollTotp/verifyTotp/disableMfa), identities (listIdentities/unlinkIdentity), deleteAccount (invoke fn).
- **`delete-account` Edge Function** (verify_jwt=true) — transfers owned pools to the oldest other member (else deletes), soft-deletes the profile, `admin.deleteUser`.
- **`SecurityScreen`** (Settings stack) — change email, change password, MFA (enroll/secret/verify/disable), linked providers (list + unlink ≥1 guard + link Google), delete account (2-step confirm → signOut).
- **Settings** account section → nav button to Security (replaces placeholder); nav route + i18n `security.*`.

## ADR
ADR-022 — delete via service-role Edge Function (pool transfer → soft-delete → purge); reuse the OAuth browser flow for linking; reauth before password change.

## Verification
tsc/jest clean; PG: transfer (shared→u2) / delete (solo) / profile deleted_at. Device: SecurityScreen renders all sections with real identity/MFA data; ≥1-identity guard hides unlink. Destructive flows not executed on the live account.

## Activation (done)
`functions deploy delete-account`. No migration.

## Carried forward
- **Passkeys (FR-AS5)** → V9 (native biometrics).
- MFA enroll→verify E2E + Google-link OAuth round-trip need an authenticator / interactive session.

## Next
Bolt V8 — Avatar upload (native image picker) — first native-module bolt.
