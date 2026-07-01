# Bolt V7 — Stage 2: Design + ADR-022 (Account & Security)

## ADR-022 — Delete via service-role Edge Function; reuse the OAuth browser flow for linking
- **Delete account:** a `delete-account` Edge Function (verify_jwt=true) does the privileged work: `userClient.auth.getUser()` → uid; `adminClient` transfers owned pools (oldest other active member, else delete pool), sets `profiles.deleted_at`, `admin.deleteUser(uid)`. Client invokes then `signOut`.
- **Link Google:** `linkIdentity({provider:'google', redirectTo:'betmeet://auth/callback', skipBrowserRedirect:true})` → `Linking.openURL` — mirrors `signInWithGoogle`; the existing `auth/callback` deep link + `exchangeCodeForSession` completes the link.
- **Reauth for password:** verify the current password with `signInWithPassword(email,current)` before `updateUser({password})`.

## Files
- **`authService`** += `changeEmail(email)` (`updateUser({email})`), `changePassword(current,new)` (reauth → update; maps `invalidCredentials`).
- **`src/auth/googleOAuth.ts`** += `linkGoogle()` (linkIdentity + openURL).
- **`src/settings/data/securityApi.ts`**:
  - MFA: `listFactors()`, `enrollTotp()` → `{factorId,secret,uri}`, `verifyTotp(factorId,code)`, `disableMfa(factorId)`.
  - Identities: `listIdentities()`, `unlinkIdentity(identity)`.
  - `deleteAccount()` → `supabase.functions.invoke('delete-account')`.
- **`supabase/functions/delete-account/index.ts`** + `config.toml [functions.delete-account] verify_jwt=true`.
- **`SecurityScreen`** — sections (each self-contained with local state + inline error/success):
  - Change email (field → changeEmail → "check your inbox").
  - Change password (current + new → changePassword).
  - MFA (status from listFactors; enroll shows secret + 6-digit verify; disable).
  - Linked providers (list email/google; unlink disabled when only 1; link Google button).
  - Delete account (destructive; two-step confirm → deleteAccount → signOut).
- **Nav** — `SettingsStackParamList += Security:{}`; register in `SettingsStack`.
- **Settings** — account section → `Button` navigating to Security (replaces "coming soon").
- **i18n** — `security.*` (labels, hints, errors, confirmDelete).

## Test
- tsc + jest.
- Backend: `delete-account` pool-transfer logic on ephemeral PG (owner with other members → ownership transfers; solo owner → pool deleted; profile deleted_at set).
- Device: SecurityScreen renders all sections; change-password reauth path; MFA enroll shows secret; providers list. (Full email-change/delete flows are destructive — verify render + wiring, not executed on the live account.)
