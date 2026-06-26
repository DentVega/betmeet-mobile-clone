# Bolt 2 — Write-Path Audit — Outcome

- **Status:** ✅ Complete (spike → decision)
- **Intent:** 001-mobile-v1-migration
- **Type:** investigation spike (no app code shipped beyond a profileGate name fix)

## What it produced
- **`findings.md`** — live Supabase API probe (read-only) + web-architecture confirmation: data tables are Prisma-direct, RLS SELECT-only, no callable data API; mobile can reach Auth + (with JWT) simple PostgREST reads, but no writes / no computed reads.
- **`adr-007-data-access.md`** — classification of every v1 operation (Class 1/2/3) and the **accepted decision**.

## Decision (ADR-007)
Build an **own backend in the user's Supabase project** (currently Auth-only), blueprinted on `../betmeet-clone`. **RLS for reads, Edge Functions (Deno) for writes**, mobile talks directly to Supabase — **no Next.js server**. Defer live sync / notifications / email.

## Impact
- Inception re-scoped: `requirements.md` + `system-context.md` updated from "frozen reuse" to "own Supabase backend".
- `bolt-plan.md` re-sequenced: **backend bolts inserted before the mobile write bolts** (schema+RLS → Edge Functions → match seed).
- `profileGate.ts` corrected to real names (`profiles` / `onboarding_completed`).

## Carried forward
- Decide where the `supabase/` project (migrations + functions) is versioned — default: a `supabase/` dir in this repo. Confirmed at the first backend bolt.
- Mobile data/query layer (TanStack Query hooks) is built per feature bolt once the backend endpoints exist.

## Next
Backend bolt 1 — apply core schema + RLS to the user's Supabase.
