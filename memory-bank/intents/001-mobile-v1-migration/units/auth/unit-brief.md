# Unit: Auth

> Part of Intent 001 — Betmeet Mobile v1. Mirrors web unit `src/features/auth`.

## Purpose
Account creation, login, email verification, and password reset against the existing Supabase Auth project. Establishes and maintains the session the rest of the app depends on.

## In scope (v1)
- Email/password sign-up with client validation + Supabase verification email.
- Email verification via deep link (`betmeet://auth/confirm`).
- Email/password sign-in.
- Google OAuth sign-in/up (system-browser flow, deep-link return; Supabase auto-linking by email).
- Password reset (request email → reset via deep link → set new password).
- Session persistence in secure storage, silent refresh, sign-out.
- Unverified-email gate.

## Out of scope (v1)
- Passkeys (WebAuthn) and TOTP MFA → v2.
- Account deletion, email change, linked-provider management → live in Settings (deferred).

## Requirements covered
FR-A1 … FR-A7. (Backend mirror: web auth unit, FR-REFINE-15.*)

## Screens
Sign in · Sign up · Forgot password · Reset password · Verify email (+ resend).

## Key integrations
- `@supabase/supabase-js`: `signUp`, `signInWithPassword`, `signInWithOAuth`, `resetPasswordForEmail`, `verifyOtp`/`exchangeCodeForSession`, `refreshSession`, `signOut`, `getUser`.
- Secure storage adapter (Keychain/Keystore) for the Supabase session (NFR-5).
- Deep-link router for confirm/reset returns (system-context §4).

## Dependencies
- **Provides:** session + `userId` + verified flag to every other unit and the navigation state machine.
- **Depends on:** App-shell deep-link router + secure-storage setup (App-shell bolt).

## Topology
Host bundle (must be available at boot). Not a remote candidate.

## Risk notes
- OAuth redirect/deep-link round-trip is the trickiest mobile-specific flow — prototype early.
- Most auth maps to Supabase SDK calls (write-path class 1), so low backend-integration risk vs Pools/Predictions.

## Stories
See `stories/` (US-A1 … US-A6).
