# Bolt V7 — Stage 1: Model (Account & Security — non-native)

> Intent 002 · unit `account-security` (non-native half; Passkeys FR-AS5 → V9). Traces to US-AS1/AS2/AS3/AS4/AS6, FR-AS1/AS2/AS3/AS4/AS6. Fills the Settings "Cuenta y seguridad" section (V2 placeholder).

## Ubiquitous language
- **Change email** — `updateUser({email})` sends a confirmation to the new address; the existing `betmeet://auth/confirm` deep link (type `email_change`) completes it. (FR-AS1)
- **Change password** — re-authenticate with the current password, then `updateUser({password})`. (FR-AS2)
- **Delete account** — a guarded Edge Function transfers owned pools (to the oldest other member, else deletes the pool), soft-deletes the profile (`deleted_at`), then `admin.deleteUser` (service role). Client signs out. (FR-AS3)
- **MFA/TOTP** — `supabase.auth.mfa.enroll/challenge/verify/unenroll`; show the secret (manual entry) → verify 6 digits → enabled; login then prompts (Supabase handles AAL). (FR-AS4)
- **Linked providers** — `getUserIdentities()`; unlink (guard ≥1 active); link Google via `linkIdentity` (OAuth browser flow, reused). (FR-AS6)

## Deliverables
- **`authService`** += `changeEmail(email)`, `changePassword(current,new)` (reauth via `signInWithPassword` then `updateUser`).
- **`src/settings/data/securityApi.ts`** — MFA (`listFactors`/`enroll`/`verify`/`disable`), identities (`listIdentities`/`unlink`/`linkGoogle`), `deleteAccount()` (invoke Edge Function).
- **Edge Function `delete-account`** (verify_jwt=true) — `userClient` → uid; `adminClient` → transfer/delete owned pools, soft-delete profile, `admin.deleteUser`.
- **`SecurityScreen`** (new, under Settings stack) — sections: Change email, Change password, MFA (enroll/verify/disable), Linked providers (list + unlink + link Google), Delete account (destructive confirm → signOut).
- **Settings** — replace the "coming soon" account section with a nav button → SecurityScreen.
- **Nav** — `SettingsStackParamList += Security`.
- **i18n** — `security.*`.

## Invariants
- Password change requires the correct current password (reauth) before update.
- Delete is irreversible and destructive — explicit confirmation; owned pools handled before purge so no orphaned pools.
- Never unlink the last remaining auth method (≥1 identity).
- Delete/purge run server-side with the service role; the client only triggers it with its JWT.

## Out of model
Passkeys (FR-AS5 → V9, native); recovery-codes UI; email-change edge cases beyond the standard confirm link.
