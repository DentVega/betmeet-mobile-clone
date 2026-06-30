# Bolt 3 — Backend: Core schema + RLS — Outcome

- **Status:** ✅ Complete (SQL authored + validated locally; **user runs `db push`** to apply)
- **Intent:** 001-mobile-v1-migration · Phase B (own backend)
- **DDD stages:** Model → Design → ADR-008/009 → Implement → Test (checkpoints approved)
- **FRs:** FR-BK1 (schema), FR-BK2 (RLS)

## What shipped
A `supabase/` project (Supabase CLI) recreating the v1 core in the user's Supabase:
- **10 tables** (snake_case, from blueprint): `avatar_assets, profiles, teams, competitions, competition_phases, matches, pools, pool_memberships, predictions, prediction_scores` + 7 enums + constraints/indexes (capacity 2–100, scores 0–20, partial-unique public-pool name + prediction scope).
- **RLS**: 16 policies — authenticated reads (own profile/others, reference data, own predictions, public/member pools, co-member memberships, own/pool-peer scores); public avatar reads. Game-state writes reserved for Edge Functions. `is_pool_member()` SECURITY DEFINER helper prevents RLS recursion.
- **Triggers**: `handle_new_user` (auto-create profile on signup — closes the Bolt 1 gate gap), `prediction_lock_guard` (locked predictions immutable), `set_updated_at`.
- **Seed**: 6 default avatar assets. Config lists the `betmeet://` redirect URLs.

## Files
`supabase/config.toml`, `supabase/migrations/2026063012{0000_enums,0100_core_tables,0200_rls,0300_triggers,0400_seed_avatars}.sql`, `supabase/seed.sql`, `supabase/README.md`, `supabase/.gitignore`.

## ADRs
ADR-008 (Supabase CLI migrations, not Prisma) · ADR-009 (RLS reads + Edge-Function writes + profile/lock triggers).

## Verification
Applied cleanly to an ephemeral Postgres 17 (Docker was down; used a throwaway brew cluster): 5/5 migrations OK, trigger created the profile row, 16 policies + 10 RLS tables present. RLS *behavior* + lock-rejection verified later (real JWT / Bolt 4).

## User action required
1. `supabase login && supabase link --project-ref uyhymoykzwlovnqpzwnn && supabase db push`.
2. Dashboard: add `betmeet://` redirect URLs (also unblocks Bolt 1 auth E2E); create public `avatars` bucket + upload `defaults/01–06.png` (or edit seed URLs).

## Carried forward
- Edge Function writes (save-prediction/create-pool/join-pool/scoring) = **Bolt 4**.
- Full World Cup teams + fixture seed = **Bolt 5**.
- `nickname` discriminator-assignment function = Bolt 4 (referenced by Onboarding, Bolt 6).

## Next
Bolt 4 — Backend: Edge Functions.
