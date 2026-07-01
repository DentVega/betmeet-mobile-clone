# Bolt V5 — Pool Depth (backend) — Outcome

- **Status:** ✅ Complete (validated on ephemeral PG17). Backend-only (SQL).
- **Intent:** 002-v2-web-parity · unit `pool-depth` (backend) · Stories US-PD1…PD7 (+ FR-PP1 reads)
- **DDD:** Model → Design+ADR-020 → Implement → Test (checkpoints approved)

## What shipped (migration `20260701150000_pool_depth.sql`)
- `pools.archived_at`; `"InviteStatus"` enum; **`pool_directed_invites`** table + RLS (participants read; writes via fns only) + partial-unique pending index.
- **RPCs** (SECURITY DEFINER + auth.uid(), called via `supabase.rpc` — ADR-020, no Edge Functions):
  - `fn_search_nicknames(prefix,limit)` — typeahead.
  - `fn_create_directed_invite` / `fn_respond_invite` — permission (owner/member+flag), capacity, dedupe; accept → membership.
  - `fn_rename_pool` / `fn_set_pool_visibility` — owner + public-name uniqueness.
  - `fn_set_members_can_invite` / `fn_archive_pool` — owner.
  - `fn_pool_predictions(pool)` — masked grid (own visible; others revealed at kickoff; pre-join null).
  - **reworked `fn_pool_leaderboard(pool)`** — membership-scoped (kickoff ≥ joined) + effective prediction (override else global).
  - reworked `fn_discover_pools` — exclude archived.

## ADR
ADR-020 — pool-depth writes as direct SECURITY DEFINER RPCs (no Edge Function per op); only `db push` to activate.

## Effective-prediction rule (single source)
`coalesce(pool_override, global)` per (user,match); used by both the grid and the leaderboard.

## Verification
PG17 (14 migrations): invites, owner controls (NAME_TAKEN, flag gate, archive→discover), masking (future hidden / pre-join null / own & past-of-other visible), scoped leaderboard (override precedence + join-date scoping). All correct.

## Activation
`supabase db push` (migration only; no functions deploy). Note: reworks `fn_pool_leaderboard` (existing PoolLeaderboardScreen now shows scoped values — same columns) and `fn_discover_pools`.

## Carried forward → V6 (mobile)
Invite form (nickname typeahead) · pool settings panel (rename/visibility/members-can-invite/archive) · predictions grid · scoped leaderboard screen · per-pool prediction override UI (FR-PP1) · pool-leaderboard live projection.

## Next
Bolt V6 — Pool Depth (mobile).
