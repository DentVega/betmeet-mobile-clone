# Stories — Auth

> Format: `US-Ax` · As a … I want … so that … · AC = acceptance criteria (Given/When/Then) · traces FR.

## US-A1 — Sign up with email — FR-A1, FR-A7
As a new user I want to register with email + password so that I can create an account.
- AC: Given valid email + matching password ≥8 chars, when I submit, then Supabase creates the user and a verification email is sent and I see a "check your email" state.
- AC: Given invalid email / weak / mismatched password, when I submit, then inline validation blocks submission.
- AC: Given an unverified account, when I try to reach the app, then I'm held at the verify-email gate.

## US-A2 — Verify email via deep link — FR-A2
As a user I want tapping the email link to verify my account so that I can sign in.
- AC: Given a `betmeet://auth/confirm?token_hash=…&type=…` link, when opened, then the token is exchanged, my email is marked confirmed, and I'm routed to sign-in/onboarding.
- AC: Given an expired/invalid token, when opened, then I see an error with a resend option.

## US-A3 — Sign in with email — FR-A3, FR-A6
As a registered user I want to sign in so that I reach my pools and predictions.
- AC: Given correct verified credentials, when I sign in, then a session is created and tokens are stored in secure storage and I land per the nav state machine.
- AC: Given wrong credentials, then I see an error and no session is stored.
- AC: Given a stored valid session at launch, then I'm signed in without re-entering credentials (silent refresh on expiry).

## US-A4 — Google OAuth — FR-A4
As a user I want to continue with Google so that I can skip password entry.
- AC: Given I tap "Continue with Google", when I complete consent in the system browser, then control returns via deep link and a session is established.
- AC: Given my Google email matches an existing account, then Supabase links the identity (no duplicate account).

## US-A5 — Password reset — FR-A5
As a user who forgot my password I want to reset it via email so that I regain access.
- AC: Given I request reset with my email, then a reset email is sent.
- AC: Given I open the `betmeet://auth/reset` link and submit a valid new password, then my password is updated and I can sign in.

## US-A6 — Sign out — FR-A6
As a signed-in user I want to sign out so that my session is cleared on a shared device.
- AC: Given I sign out, then the Supabase session ends, secure storage is cleared, and I return to the Auth stack.
