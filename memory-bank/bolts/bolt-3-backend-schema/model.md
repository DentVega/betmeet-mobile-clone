# Bolt 3 — Stage 1: Model (Backend core schema + RLS)

> First backend bolt (Phase B). Models the v1 data domain to recreate in the user's Supabase, derived from the `../betmeet-clone` blueprint (exact DDL extracted in the audit). Writes go through Edge Functions (Bolt 4); this bolt establishes tables, relationships, RLS, and the two guarding triggers. Traces to FR-BK1, FR-BK2.

## v1 entity set (INCLUDE)
| Table | Purpose | Mobile access (RLS) |
|---|---|---|
| `profiles` | identity (id = auth.users.id), nickname+discriminator, avatar, onboarding gate, locale | SELECT own + others(non-deleted); UPDATE own |
| `avatar_assets` | default avatar catalog | SELECT public |
| `teams` | World Cup teams (name, fifa_code, flag) | SELECT authenticated |
| `competitions` | the tournament (slug, season, timezone, is_active) | SELECT authenticated |
| `competition_phases` | GROUP / KNOCKOUT phases | SELECT authenticated |
| `matches` | fixtures (teams or placeholders, kickoff, status, scores, winner) | SELECT authenticated |
| `pools` | leagues (name, type, capacity, invite_token, owner) | SELECT public OR member |
| `pool_memberships` | membership (pool,user,joined,archived) | SELECT co-members |
| `predictions` | user picks (scores, penalty winner, pool scope, locked_at) | SELECT/INSERT/UPDATE own-unlocked |
| `prediction_scores` | computed points (1:1 prediction) | SELECT own + pool-peers |

## Deferred (NOT in v1 schema)
- `pool_directed_invites` — directed invites are v2 (link/token join only in v1).
- `notification_preferences`, `push_subscriptions`, `notification_events`, `notification_deliveries` — push deferred to v2.
- `provider_sync_runs` + provider sync columns (`provider_match_id`, `provider_competition_id`, `provider_team_id`, `raw_status`) — live football-data sync deferred (manual seed instead).
- `email_action_throttle` — Supabase Auth handles auth emails; custom throttle not needed.
- Match **admin-override audit** columns (`manual_override*`, `overridden_*`) — admin deferred; v1 results are entered directly.

## Enums (v1 subset)
`VerificationStatus`, `AvatarSource`, `PoolType`, `CompetitionPhaseType`, `MatchStatus`, `PredictionLockReason`, `ScoreMatchedCase`. (Notification/provider enums deferred.)

## Relationships (FK graph, v1)
```
auth.users → profiles(id)
profiles → pools(owner_id, RESTRICT) · pool_memberships(user_id, CASCADE)
         · predictions(user_id, CASCADE) · prediction_scores(user_id, CASCADE)
competitions → competition_phases(competition_id) → matches(phase_id)
competitions → matches(competition_id)
matches → teams(home/away/winner, SET NULL) · predictions(match_id) · prediction_scores(match_id)
pools → pool_memberships(pool_id, CASCADE) · predictions(pool_id, CASCADE, nullable=global)
predictions → prediction_scores (1:1) · teams(penalty_winner, SET NULL)
```

## Access model (RLS — ubiquitous rules)
- **Read** is the mobile happy path (PostgREST + JWT, role `authenticated`): own profile + others' non-deleted; teams/competitions/phases/matches readable to any authenticated user; own predictions; own pools + public pools; co-member memberships; own scores + pool-peer scores; public avatar assets.
- **Write** of game data is **not** done directly by clients except the blueprint's `predictions` own-unlocked INSERT/UPDATE. Pools/scoring writes have **no client RLS write policy** → they go through Edge Functions (service role, Bolt 4). Profile UPDATE-own is allowed (onboarding/nickname), but nickname **discriminator assignment** is a function (Bolt 4) to keep uniqueness atomic.

## Guarding triggers (carried from blueprint)
- **`handle_new_user`** (AFTER INSERT on auth.users, SECURITY DEFINER): auto-create the `profiles` row with a default avatar from `avatar_assets`. Closes the "new user has no profile" gap → the Bolt 1 profile-gate read works.
- **`prediction_lock_guard`** (BEFORE UPDATE on predictions): reject changes to a locked prediction's scores/penalty. Makes the kickoff lock tamper-proof even if a client tries a direct PostgREST update.

## Key constraints (v1)
- `profiles` unique (nickname_base, nickname_discriminator); locale CHECK in ('es','en').
- `pools` capacity CHECK 2–100; invite_token unique; partial-unique public-pool name.
- `predictions` score CHECK 0–20; partial-unique (user,match) global and (user,match,pool).
- `prediction_scores` unique prediction_id (1:1).

## Invariants
- `profiles.id` is exactly `auth.users.id` (no separate identity).
- A locked prediction is immutable (trigger), independent of RLS.
- Pool capacity, invite-token generation, and scoring correctness are enforced **server-side** (Edge Functions), not by RLS alone.

## Out of model
Edge Function logic (Bolt 4); seed data (Bolt 5); mobile query hooks (Phase C).
