# Active Context

> **Agent note:** This is your short-term memory. Read it at the start of every session and update it immediately after making an important decision, changing focus, or encountering a blocker.

## Current Focus
- **Bolt 2 (Write-Path Audit) complete → MAJOR RE-SCOPE (ADR-007).** The betmeet-clone backend exposes data only via Next.js server actions (not mobile-callable). New direction: **build an own backend in the user's Supabase** (currently Auth-only), blueprinted on `../betmeet-clone`. Architecture: **RLS reads + Edge Functions (Deno) writes, mobile-direct, no Next.js.** Defer: live football-data sync, push, email.
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
- **User action:** apply Bolt 3 schema — `supabase login && supabase link --project-ref uyhymoykzwlovnqpzwnn && supabase db push`; in dashboard add `betmeet://` redirect URLs + create public `avatars` bucket.
- **`/bolt-start` for Bolt 4 — Backend: Edge Functions** (save-prediction w/ lock, create-pool, join-pool, basic scoring; + nickname discriminator fn). Then Bolt 5 (match seed), then Phase C mobile features.
- `supabase/` lives in this repo (Q5 resolved). Bolt 3 SQL validated on ephemeral PG17; not yet applied to the real project.
