# Bolt 9 — Stage 1: Model (Leaderboard & Rankings) — FINAL v1 bolt

> Read-only standings: a global ranking + a per-pool leaderboard, from server-computed `prediction_scores`. Traces to `units/leaderboard/` (US-L1…L3). No client scoring.

## Ubiquitous language
- **Global ranking** — all players ranked by their total points (sum of their **global-scope** prediction scores, `pool_id = null`).
- **Pool leaderboard** — the members of a pool ranked by their points. **v1 model:** since v1 predictions are global-only (Matches tab), a pool leaderboard ranks its members by their **global points** (the pool is a friend-group view over the shared global standings). Includes members with 0.
- **RankRow** — `{ userId, nickname (base#disc), avatarUrl, totalPoints, rank }`. `rank` via SQL `rank()` (ties share a rank).
- **Viewer highlight** — the caller's own row is visually marked.

## Why server RPCs (RLS nuance, like discover)
`prediction_scores` RLS = own + pool-peers → a client **cannot** read other users' global scores to build a global ranking. So aggregation runs in **SECURITY DEFINER read RPCs** that return ranked rows (nickname/avatar/points) without exposing individual score rows:
- `fn_global_ranking(p_limit)` — sum of global-scope scores per user → ranked.
- `fn_pool_leaderboard(p_pool)` — pool members ranked by their global points; **caller must be a member** (`NOT_MEMBER`).

## Backend additions (this bolt)
Migration `20260630170000_ranking_functions.sql`: `fn_global_ranking`, `fn_pool_leaderboard` (SECURITY DEFINER, `grant execute to authenticated`). Reads only; called via `supabase.rpc`. No Edge Functions.

## Mobile shape
- **RankingsScreen** (the Rankings tab, replacing the placeholder): global ranking via `fn_global_ranking`, FlashList, viewer highlighted, focus refetch.
- **PoolLeaderboardScreen** (new, reached from PoolDetail's "leaderboard" link): `fn_pool_leaderboard(poolId)`. Add `PoolLeaderboard{poolId}` to the Pools stack; wire the PoolDetail button.

## Invariants
- 100% read-only on mobile; points come straight from `prediction_scores` (computed by `compute-score`).
- Cross-user aggregates only via the DEFINER RPCs (no per-row score leakage; RLS respected for direct reads elsewhere).
- Pool leaderboard requires membership (server-checked).

## Out of model / v1 simplifications
- **Live projection** for in-progress matches (web feature) — deferred; v1 ranks finalized `prediction_scores` only.
- Pool-scoped *distinct* predictions (web had `pool_id` on predictions) — v1 uses global predictions, so pool leaderboards rank members by global points. Revisit if per-pool predictions are surfaced later.
