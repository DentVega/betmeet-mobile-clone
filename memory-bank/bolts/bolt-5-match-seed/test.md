# Bolt 5 — Test (match seed)

> Applied all 7 migrations (Bolt 3 schema/RLS/triggers + Bolt 4 write-functions + this seed) on an ephemeral Postgres 17 and exercised the seed end-to-end.

## Seed counts (asserted)
| competitions | phases | teams | matches | finished |
|---|---|---|---|---|
| 1 | 5 | 16 | 14 | 3 |
Matches as designed (Group A full round-robin, B/C/D partial, 2 knockout placeholders).

## Idempotency
Re-applying the seed migration produced no error and **matches stayed 14** (ON CONFLICT DO NOTHING + stable UUIDs). Safe for repeated `db push`.

## Exercised against the seed (ties Bolt 4 + Bolt 5)
- `fn_save_prediction` on a **SCHEDULED** seeded match (Group A, future kickoff) → `ok=true`.
- `fn_save_prediction` on a **FINISHED** seeded match → `ok=false, code=LOCKED`.

## Not covered here (needs deploy)
- `compute-score` over a FINISHED seeded match producing `prediction_scores` (Deno/admin-secret) — verify after `functions deploy`; the 3 FINISHED rows make this immediately demoable.
- Real fixture accuracy — synthetic by design (ADR-011); replace/expand later.

## User action
Seed applies with `supabase db push` (it's a migration). After deploying functions, invoke `compute-score` for the 3 FINISHED matches to populate scores/leaderboard.
