# Unit: Account & Security

> Intent 002 (v2). Mirrors web `settings/security` + auth account actions (Units 19/20/21/38).

## Purpose
Account management + advanced auth: change email/password, delete account, MFA/TOTP, Passkeys (biometrics), linked-providers management.

## In scope
FR-AS1 change email (single-link confirm) · FR-AS2 change password · FR-AS3 delete account (hard purge) · FR-AS4 MFA/TOTP · FR-AS5 Passkeys (native) · FR-AS6 linked providers (≥1 active).

## Out of scope
Web admin; recovery-codes UI beyond MFA basics.

## Integrations
Supabase Auth SDK (updateUser, MFA enroll/verify, passkey API); Edge Function `delete-account` (service-role purge + pool transfer); deep link for email-change confirm.

## Dependencies
Depends on: Auth (v1), Settings shell (Profile & Settings unit). Provides: secure account controls.

## Native module
**Passkeys/biometrics** (FR-AS5) — platform WebAuthn + Face ID/fingerprint (Q2 lib). MFA is pure JS.

## Risk
Passkey lib ↔ Supabase passkey API compatibility on bare RN; delete-account must atomically transfer owned pools before purge (server-side).

## Stories
`stories/` (US-AS1…AS6).
