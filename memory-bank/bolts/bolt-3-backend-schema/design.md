# Bolt 3 — Stage 2: Design (Backend core schema + RLS)

> Concrete plan to recreate the v1 schema + RLS in the user's Supabase, versioned in `supabase/` in this repo. Implements the Stage-1 model. Choices locked → `adr/`.

## Locked choices
| Concern | Choice | ADR |
|---|---|---|
| Migration tooling | **Supabase CLI** SQL migrations (no Prisma runtime in our backend) | ADR-008 |
| Write strategy | Reads via RLS; `predictions` keep blueprint own-unlocked RLS; pools/scoring writes via Edge Functions (Bolt 4) | ADR-009 |
| Profile creation | **`handle_new_user` trigger** on `auth.users` (SECURITY DEFINER) | ADR-009 |
| Backend location | `betmeet-mobile-clone/supabase/` (req Q5) | — |

## `supabase/` structure
```
supabase/
├── config.toml                      # project id, auth, etc. (from `supabase init`)
├── migrations/
│   ├── 20260630120000_enums.sql          # v1 enums
│   ├── 20260630120100_core_tables.sql    # tables + FKs + constraints + indexes
│   ├── 20260630120200_rls.sql            # enable RLS + policies
│   ├── 20260630120300_triggers.sql       # handle_new_user, prediction_lock_guard, updated_at
│   └── 20260630120400_seed_avatars.sql   # minimal default avatar_assets (for the trigger)
├── seed.sql                          # optional local-reset seed (teams/competition stub → Bolt 5 owns full seed)
└── functions/                        # Edge Functions land in Bolt 4
```
(`matches`/`teams`/full fixture seed = Bolt 5. This bolt only seeds a few default avatars so `handle_new_user` has assets.)

## Migration content plan
1. **enums** — `VerificationStatus, AvatarSource, PoolType, CompetitionPhaseType, MatchStatus, PredictionLockReason, ScoreMatchedCase` (v1 subset; provider/notification enums omitted).
2. **core_tables** — in FK order: `avatar_assets`, `profiles` (FK→auth.users, RESTRICT on delete of auth user is N/A; CASCADE from auth), `teams`, `competitions`, `competition_phases`, `matches`, `pools`, `pool_memberships`, `predictions`, `prediction_scores`. Snake_case columns exactly as the blueprint, minus deferred columns (provider_*, raw_status, manual_override*, overridden_*). Include the CHECK constraints (locale, capacity 2–100, scores 0–20, non-negative match scores), the unique constraints, partial-unique indexes (public pool name; prediction global/pool scope), and the secondary indexes.
3. **rls** — `ALTER TABLE … ENABLE ROW LEVEL SECURITY` + policies (verbatim from the audit):
   - profiles: select_own, select_others(non-deleted), update_own.
   - pools: select_public, select_member.
   - pool_memberships: select_same_pool.
   - teams/competitions/competition_phases/matches: select_authenticated.
   - predictions: select_own, insert_own, update_own_unlocked.
   - prediction_scores: select_own, select_pool_peers.
   - avatar_assets: select_public (true).
   - (no INSERT/UPDATE/DELETE policy for pools/pool_memberships/prediction_scores → those mutate via Edge Functions/service role.)
4. **triggers** — `handle_new_user()` (+ trigger on auth.users) creating the profile row with a random default avatar; `prediction_lock_guard()` (+ BEFORE UPDATE on predictions); a generic `set_updated_at()` trigger for tables with `updated_at`.
5. **seed_avatars** — insert ~6 default `avatar_assets` rows (public URLs / storage keys) so new profiles get an avatar.

## Helper functions referenced by RLS
- `is_pool_member(pool_id, uid)` (SECURITY DEFINER, STABLE) to avoid recursive RLS on `pool_memberships`/`pools` self-joins (the blueprint's member policies need a SECURITY DEFINER helper to prevent infinite RLS recursion). Documented in ADR-009.

## Apply logistics (Implement stage) — needs user/credentials
Applying to the user's Supabase requires authenticated CLI:
- `supabase init` (local, no creds) — I can do.
- `supabase link --project-ref uyhymoykzwlovnqpzwnn` — needs a **Supabase access token** (`SUPABASE_ACCESS_TOKEN`) — **user provides or runs**.
- `supabase db push` — applies migrations (needs link + DB password) — **user runs**, or grants creds.
Plan: I author + validate all SQL and scaffold `supabase/`; **the user runs `link` + `db push`** (or supplies `SUPABASE_ACCESS_TOKEN` + DB password so I can). Verified by querying a table with a user JWT afterward.

## Test surface (Stage 5)
- SQL validity: `supabase db lint` / local `supabase db reset` against a local Postgres (if Docker available), else careful review + apply to a branch/staging.
- RLS smoke: with a real user JWT, confirm SELECT own profile works and SELECT others' predictions is blocked.
- Profile-gate end-to-end: a fresh signup auto-gets a `profiles` row (trigger) → Bolt 1 gate resolves to `false` (onboarding) rather than the error fallback.
