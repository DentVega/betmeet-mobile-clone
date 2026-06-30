# Active Context

> **Agent note:** This is your short-term memory. Read it at the start of every session and update it immediately after making an important decision, changing focus, or encountering a blocker.

## Current Focus
- **🏁 v1 FEATURE-COMPLETE — all 10 bolts (0–9) done, validated locally** (tsc clean, jest 51/51, Rspack bundle green; all SQL/functions exercised on ephemeral PG17). Remaining work is **activation**, not features.
- Backend: Bolts 3–5 already deployed/live (7 migrations + 4 functions + ADMIN_SECRET). **Pending push/deploy:** migrations set_nickname/pool_functions/ranking_functions + functions set-nickname/leave-pool/kick-member/delete-pool. Native rebuild needed for FlashList. Dashboard: redirect URLs + avatars bucket.
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
- **Activate v1** (see progress.md "Activation checklist"): `supabase db push`; `supabase functions deploy set-nickname leave-pool kick-member delete-pool`; `pod install` + native rebuild (FlashList); dashboard redirect URLs + `avatars` bucket; optionally `compute-score` on the 3 FINISHED seeded matches.
- Then **device E2E** (agent-device): signup→verify→onboarding→predict→pool join (deep link)→leaderboard. After that, candidate v2 work: live projection, custom avatar upload, push, Passkeys/MFA, Settings, Admin, directed invites.
