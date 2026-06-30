# Active Context

> **Agent note:** This is your short-term memory. Read it at the start of every session and update it immediately after making an important decision, changing focus, or encountering a blocker.

## Current Focus
- **Phase B (own backend) COMPLETE (code).** `supabase/` has all migrations (schema, RLS, triggers, write-functions, dev fixture) + 4 Deno Edge Functions. All validated on ephemeral PG17 (7 migrations apply clean; functions exercised: create/join/save/lock/scoring rules; seed counts + idempotency). **Not yet applied to the real Supabase.** Next: **Phase C — Bolt 6 (Onboarding)**.
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
- **User action to activate the backend:** `supabase login && link --project-ref uyhymoykzwlovnqpzwnn && db push`; `supabase functions deploy save-prediction create-pool join-pool compute-score`; `supabase secrets set ADMIN_SECRET=<value>`; dashboard: `betmeet://` redirect URLs + public `avatars` bucket.
- **`/bolt-start` for Bolt 6 — Onboarding (Phase C, mobile).** Then 7 Predictions, 8 Pools, 9 Leaderboard. Recommended: run `db push` + `functions deploy` before/early in Phase C to verify mobile flows against the real project.
