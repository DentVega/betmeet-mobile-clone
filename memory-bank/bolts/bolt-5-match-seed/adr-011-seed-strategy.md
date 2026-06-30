# ADR-011 — Dev fixture as an idempotent migration

- **Status:** Accepted (Bolt 5)
- **Context:** v1 needs seeded teams/matches in the user's Supabase. `supabase/seed.sql` only runs on local `db reset`, not on `db push` to a remote — so it wouldn't populate the real project the mobile app uses.
- **Decision:** Ship the representative dev fixture as an **idempotent migration** (`20260630140000_seed_dev_fixture.sql`) using **stable fixed UUIDs** + `ON CONFLICT (id) DO NOTHING`. It applies to the remote via the same `db push` flow and is safe to re-run.
- **Alternatives:** seed.sql only (rejected — not applied by `db push`); a one-off script the user runs separately (rejected — extra manual step, drifts from the migration history).
- **Consequences:** The fixture travels with the schema. Results are entered later by updating a match row (status/scores/winner) and invoking `compute-score`. To expand toward the full tournament, append teams/matches with the same structure. Synthetic-but-realistic data (real draw accuracy is out of scope).
