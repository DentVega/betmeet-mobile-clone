# Active Context

> **Agent note:** This is your short-term memory. Read it at the start of every session and update it immediately after making an important decision, changing focus, or encountering a blocker.

## Current Focus
- **Bolt 0 (Foundations & App Shell) complete** for Intent 001. Host shell built: React Navigation v7 state machine, Supabase+keychain session, TanStack Query+Zustand, betmeet:// deep links, i18n seed. `tsc` clean, 21 jest tests pass, Rspack android bundle green. Artifacts: `memory-bank/bolts/bolt-0-foundations/`. Next: **Bolt 1 — Auth**.

## Recent Technical Decisions
- **Single bundle, host-only — no Module Federation in v1.** Remote candidates (Matches, Pools, Leaderboard) recorded for later; do not `/repack-init` until reversed.
- **v1 scope:** Auth (email + Google + verify/reset; Passkeys/MFA → v2), Onboarding (nickname + default-avatar gate; custom upload → v2), Matches & Predictions, Pools, Leaderboard. Settings, push, biometrics, Admin → out.
- **Native:** secure token storage (mandatory) + deep links (`betmeet://` for email confirm/reset + pool join). No image picker, no push in v1.
- **Backend frozen.** Mobile is a pure Supabase/PostgREST client.
- Still **unchosen** (Bolt 0 ADRs): navigation library, data-fetching/cache library, secure-storage library, custom-scheme vs Universal/App-Links.

## Known Issues / Blockers
- **TOP RISK:** web mutations are Next.js **server actions**, not callable from mobile. Bolt 2 (Write-Path Audit) must map each v1 write to Supabase SDK / PostgREST+RLS / needs-a-thin-endpoint, and surface any backend exception to the user. Gates Onboarding/Predictions/Pools.

## Immediate Next Step
- Supply real `SUPABASE_URL` / `SUPABASE_ANON_KEY` to the build (placeholders currently), then run `/bolt-start` for **Bolt 1 — Auth**. First Bolt 1 task: native build (Pods/Gradle) + `agent-device` boot/deep-link smoke, since Bolt 0 wasn't device-verified.
