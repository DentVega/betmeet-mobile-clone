# Stories — Account & Security

## US-AS1 — Change email — FR-AS1
As a user I want to change my email so my account uses a current address.
- AC: submit new email → confirmation link sent to it; opening `betmeet://auth/confirm` updates the email; old email no longer works.
- AC: invalid/duplicate email → error, no change.

## US-AS2 — Change password — FR-AS2
As a user I want to change my password securely.
- AC: given correct current password + valid new password, the password updates; wrong current password → error.

## US-AS3 — Delete account — FR-AS3
As a user I want to delete my account permanently.
- AC: on confirm, owned pools are transferred/handled per rules, profile soft-deleted, `auth.users` hard-purged; I'm returned to sign-in and can't log back in.
- AC: destructive confirmation required.

## US-AS4 — MFA/TOTP — FR-AS4
As a user I want optional 2FA.
- AC: enroll shows a QR + secret; entering a valid 6-digit code enables MFA; login then prompts for the code; disable removes it.

## US-AS5 — Passkeys — FR-AS5
As a user I want to sign in with Face ID/fingerprint.
- AC: register a passkey (biometric prompt) → listed; sign-in with passkey works; delete removes it; the system never drops my last remaining auth method.

## US-AS6 — Linked providers — FR-AS6
As a user I want to manage my sign-in methods.
- AC: see email/Google/passkeys with link/unlink; unlinking is blocked if it would leave zero active methods.
