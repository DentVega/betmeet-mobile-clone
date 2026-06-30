# Bolt 5 — Backend: match seed — Outcome

- **Status:** ✅ Complete (SQL authored + validated; applies via `db push`)
- **Intent:** 001-mobile-v1-migration · Phase B (final backend bolt)
- **DDD:** Model+Design → ADR-011 → Implement → Test (checkpoint approved)
- **FR:** FR-BK6

## What shipped
`supabase/migrations/20260630140000_seed_dev_fixture.sql` — a representative World Cup dev fixture (idempotent, stable UUIDs, ON CONFLICT DO NOTHING):
- 1 competition (`world-cup-2026`, active), 5 phases (Groups A–D + Round of 16), 16 teams (4/group), 14 matches (Group A full round-robin; B/C/D partial; 2 knockout placeholders).
- 3 FINISHED matches with scores/winner so `compute-score` → `prediction_scores` is immediately demoable; the rest SCHEDULED (future) for editable predictions.

## ADR
ADR-011 — dev fixture as an idempotent migration (so `db push` applies it; seed.sql wouldn't).

## Verification
All 7 migrations applied on ephemeral PG17; counts asserted (1/5/16/14/3); seed re-apply idempotent (still 14); `fn_save_prediction` ok on a SCHEDULED seeded match and LOCKED on a FINISHED one.

## Phase B complete
Backend minimum is authored + validated: schema+RLS (Bolt 3), Edge Functions + atomic write fns (Bolt 4), dev fixture (Bolt 5). **Not yet applied to the real Supabase** — pending the user's `db push` + `functions deploy` + `secrets set`.

## Next
**Phase C (mobile features)** — Bolt 6 Onboarding, 7 Matches & Predictions, 8 Pools, 9 Leaderboard — all consume this backend. Recommended to run `db push`/`functions deploy` before/early in Phase C so mobile flows can be verified against the real project.
