# Active Context

> **Agent note:** This is your short-term memory. Read it at the start of every session and update it immediately after making an important decision, changing focus, or encountering a blocker.

## Current Focus
- **Phase C in progress.** Backend Bolts 3–5 are **deployed & live** in the user's Supabase (7 migrations on remote; 4 Edge Functions active: save-prediction/create-pool/join-pool/compute-score; ADMIN_SECRET set; compute-score smoke returned ok). Bolts 6 (Onboarding), 7 (Matches & Predictions), 8 (Pools) **code complete + validated locally**. **Only Bolt 9 (Leaderboard) left** for v1. Pending activation: `db push` (migrations set_nickname + pool_functions) + `functions deploy set-nickname leave-pool kick-member delete-pool`; native rebuild for FlashList. Backend Bolts 3–5 + create/join/save/compute already live.
- Pending dashboard (manual): Auth redirect URLs `betmeet://...` + public `avatars` bucket (for full auth E2E + avatar images).
- Architecture (ADR-007): own Supabase backend, RLS reads + Edge Function writes, mobile-direct, no Next.js. Blueprint = `../betmeet-clone`.
- Inception re-scoped: `requirements.md`, `system-context.md`, `bolt-plan.md` updated. New phase order: Phase A (shell/auth/audit) ✅ → **Phase B (backend: schema+RLS → Edge Functions → match seed)** → Phase C (mobile onboarding/predictions/pools/leaderboard, blocked on B).
- Bolts 0/1/2 done (3/9). Env wiring done (`.env` → DefinePlugin). `profileGate` corrected to `profiles`/`onboarding_completed`.

## Recent Technical Decisions
- **Single bundle, host-only — no Module Federation in v1.** Remote candidates (Matches, Pools, Leaderboard) recorded for later; do not `/repack-init` until reversed.
- **v1 scope:** Auth (email + Google + verify/reset; Passkeys/MFA → v2), Onboarding (nickname + default-avatar gate; custom upload → v2), Matches & Predictions, Pools, Leaderboard. Settings, push, biometrics, Admin → out.
- **Native:** secure token storage (mandatory) + deep links (`betmeet://` for email confirm/reset + pool join). No image picker, no push in v1.
- **Backend frozen.** Mobile is a pure Supabase/PostgREST client.
- Still **unchosen** (Bolt 0 ADRs): navigation library, data-fetching/cache library, secure-storage library, custom-scheme vs Universal/App-Links.

## Known Issues / Blockers
- **TOP RISK:** web mutations are Next.js **server actions**, not callable from mobile. Bolt 2 (Write-Path Audit) must map each v1 write to Supabase SDK / PostgREST+RLS / needs-a-thin-endpoint, and surface any backend exception to the user. Gates Onboarding/Predictions/Pools.

## Immediate Next Step
- **`/bolt-start` for Bolt 9 — Leaderboard & Rankings** (final v1 bolt): global ranking + per-pool leaderboard from scoring output; wire the PoolDetail "leaderboard" link + Rankings tab.
- **Activation backlog:** `db push` (set_nickname + pool_functions) + `functions deploy set-nickname leave-pool kick-member delete-pool`; native rebuild for FlashList (`pod install` + run); dashboard: `betmeet://` redirect URLs + public `avatars` bucket. (Backend Bolts 3–5 + ADMIN_SECRET already live.)
