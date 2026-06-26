# Active Context

> **Agent note:** This is your short-term memory. Read it at the start of every session and update it immediately after making an important decision, changing focus, or encountering a blocker.

## Current Focus
- **Bolt 1 (Auth) complete** for Intent 001 (on branch `feat/bolt-1-auth`). 5 auth screens (RHF+zod), AuthService over supabase.auth, Google OAuth (system browser + PKCE), deep-link verify/reset/OAuth-callback, profile-gate resolved (Bolt 0 TODO closed), sign-out. `tsc` clean, 43 jest tests, Rspack bundle green. Artifacts: `memory-bank/bolts/bolt-1-auth/`. Next: **Bolt 2 — Write-Path Audit**.
- Env wiring done: `.env`/`.env.local` loaded by `rspack.config.mjs` → DefinePlugin. Real Supabase creds in `.env` (gitignored).

## Recent Technical Decisions
- **Single bundle, host-only — no Module Federation in v1.** Remote candidates (Matches, Pools, Leaderboard) recorded for later; do not `/repack-init` until reversed.
- **v1 scope:** Auth (email + Google + verify/reset; Passkeys/MFA → v2), Onboarding (nickname + default-avatar gate; custom upload → v2), Matches & Predictions, Pools, Leaderboard. Settings, push, biometrics, Admin → out.
- **Native:** secure token storage (mandatory) + deep links (`betmeet://` for email confirm/reset + pool join). No image picker, no push in v1.
- **Backend frozen.** Mobile is a pure Supabase/PostgREST client.
- Still **unchosen** (Bolt 0 ADRs): navigation library, data-fetching/cache library, secure-storage library, custom-scheme vs Universal/App-Links.

## Known Issues / Blockers
- **TOP RISK:** web mutations are Next.js **server actions**, not callable from mobile. Bolt 2 (Write-Path Audit) must map each v1 write to Supabase SDK / PostgREST+RLS / needs-a-thin-endpoint, and surface any backend exception to the user. Gates Onboarding/Predictions/Pools.

## Immediate Next Step
- Before device E2E of auth: in the Supabase dashboard allow-list redirect URLs `betmeet://auth/callback`, `/auth/reset`, `/auth/confirm`, ensure Google provider is on, and restart the dev server (DefinePlugin reads `.env`).
- Then `/bolt-start` for **Bolt 2 — Write-Path Audit** (classify every v1 mutation; confirm the `Profile` table/column names used by the profile-gate).
