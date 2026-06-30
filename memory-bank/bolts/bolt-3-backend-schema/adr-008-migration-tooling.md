# ADR-008 — Backend migrations via Supabase CLI (not Prisma)

- **Status:** Accepted (Bolt 3)
- **Context:** We own a new backend in the user's Supabase. The blueprint (betmeet-clone) used Prisma migrations, but our runtime is Supabase (Postgres + RLS + Edge Functions/Deno), with no Node/Prisma server. We need versioned, reproducible schema changes.
- **Decision:** Use the **Supabase CLI** with plain SQL migrations under `supabase/migrations/` (timestamped files), `supabase/config.toml`, and `supabase/seed.sql`. No Prisma in this repo. The SQL is hand-authored from the blueprint's exact DDL (extracted in the audit).
- **Alternatives:** Prisma Migrate (rejected — adds a Node/Prisma toolchain we otherwise don't need; our writes are Deno Edge Functions); Supabase dashboard SQL editor only (rejected — not versioned).
- **Consequences:** Schema is reviewable SQL in git. Applying needs an authenticated CLI (`supabase link` + `db push`); per the Bolt 3 decision, **the user runs `db push`** with their credentials. Edge Functions (Bolt 4) live under `supabase/functions/`.
