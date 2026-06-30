# Bolt 5 — Model + Design (Backend: match seed)

> Last Phase B bolt. A representative World Cup dev seed so Phase C (predictions/scoring/leaderboard) is fully exercisable. Traces to FR-BK6. Data bolt → Model (dataset) + Design (delivery) combined; one checkpoint.

## Dataset (representative, not the full 48/104)
- **1 competition** — `world-cup-2026` (slug), season `2026`, `is_active=true`, timezone `America/Mexico_City`, start/end in 2026.
- **5 phases** — 4 GROUP phases (Group A–D, `group_code` A/B/C/D, display_order 1–4) + 1 KNOCKOUT phase ("Round of 16", display_order 5).
- **16 teams** — 4 per group, real nations + FIFA codes (flag_key/flag_path placeholders pointing at the `avatars`/flags storage convention).
- **~14 matches** (unique `match_number` 1–14):
  - **Group A:** full round-robin (6 matches) — **2 FINISHED** (with scores + winner), 4 SCHEDULED (future kickoff).
  - **Groups B/C/D:** 2 matches each (6 total) — **1 FINISHED** (Group B), rest SCHEDULED.
  - **Knockout:** 2 placeholder matches (`home_placeholder`/`away_placeholder` e.g. "1A" vs "2B"; teams null; SCHEDULED, future).
  - Net: **3 FINISHED** (past kickoff + scores) so `compute-score` produces `prediction_scores`; the rest SCHEDULED with future kickoffs (so predictions are editable, and the lock path is testable by editing a past one).

## Status/time model
- FINISHED matches: `kickoff_at` in the past (mid-June 2026), `status='FINISHED'`, home/away scores set, `winner_team_id` set when not a draw.
- SCHEDULED matches: `kickoff_at` in the future (July 2026, after the 2026-06-30 "today") → editable predictions.

## Delivery (Design) — idempotent migration
- Seed ships as an **idempotent migration** (`20260630140000_seed_dev_fixture.sql`) so it applies to the remote via `supabase db push` (seed.sql only runs on local `db reset`).
- **Stable fixed UUIDs** + `ON CONFLICT DO NOTHING` (and `WHERE NOT EXISTS` for matches keyed by competition+match_number) → re-running is safe.
- Real results are entered later by `UPDATE matches SET status='FINISHED', home_score=…, winner_team_id=…` then invoking the `compute-score` Edge Function (Bolt 4) with `x-admin-secret` + `{matchId}`.

## ADR-011 (seed strategy)
Seed as an idempotent migration with stable IDs (vs seed.sql-only, which `db push` skips). Recorded in `adr-011-seed-strategy.md`.

## Test plan
Apply over all prior migrations on ephemeral PG17 and assert: 1 competition, 5 phases, 16 teams, 14 matches (3 FINISHED). Then exercise Bolt 4 against the seed: `fn_save_prediction` on a SCHEDULED seeded match → ok; on a FINISHED seeded match → `LOCKED`. (Full `compute-score` is Deno/deploy.)

## Out of scope
Full 48-team/104-match tournament; live football-data sync; real draw accuracy (synthetic-but-realistic). Easy to expand later by adding teams/matches with the same structure.
