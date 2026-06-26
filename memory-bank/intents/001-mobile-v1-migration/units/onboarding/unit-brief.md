# Unit: Onboarding

> Part of Intent 001 — Betmeet Mobile v1. Mirrors web `src/features/profile` onboarding flow + `/onboarding/profile`.

## Purpose
First-run profile completion that gates the app shell: assign a unique nickname, pick an avatar, acknowledge the rules, then mark onboarding complete.

## In scope (v1)
- Shell gate: block app tabs while `onboardingCompleted = false` (FR-O1).
- Nickname step with case-insensitive availability check + assigned discriminator (FR-O2).
- Avatar step from the **default set** or Google photo (FR-O3).
- Rules acknowledgement step (FR-O4).
- Complete onboarding → enter app; per-step Back without data loss (FR-O5).

## Out of scope (v1)
- Custom avatar upload (needs image picker → deferred to v2; default set only).
- Optional passkey registration step (web step 4) → v2.
- Nickname change after onboarding → Settings (deferred).

## Requirements covered
FR-O1 … FR-O5. (Backend mirror: web FR-REFINE-16.*, 17.*)

## Screens
Onboarding wizard (nickname → avatar → rules → done), shown as a dedicated stack.

## Key integrations
- `checkNicknameAvailability`, `setNickname`, `setAvatarFromDefaultSet` / `setAvatarFromGoogle`, `completeOnboarding`.
- Default-avatar asset list (read directly, NFR `A2`).
- Rules content mirrored from web (MDX → static RN content or fetched).

## Dependencies
- **Depends on:** Auth (authenticated session).
- **Provides:** completed profile so the navigation state machine admits the user to app tabs.

## Topology
Host bundle (gates the shell). Not a remote candidate.

## Risk notes
- Confirm `setNickname`/`completeOnboarding` write path (class 2 PostgREST vs class 3 needs-endpoint) in the write-path audit; nickname uniqueness/discriminator logic may be server-only.

## Stories
See `stories/` (US-O1 … US-O4).
