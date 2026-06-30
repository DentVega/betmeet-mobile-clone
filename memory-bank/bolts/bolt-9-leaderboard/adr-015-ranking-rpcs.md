# ADR-015 — Ranking via SECURITY DEFINER RPCs; pool ranks by global points (v1)

- **Status:** Accepted (Bolt 9)
- **Context:** `prediction_scores` RLS (own + pool-peers) blocks client-side cross-user aggregation needed for a global ranking. v1 predictions are global-only (Matches tab), so per-pool *distinct* predictions don't exist yet.
- **Decision:** Aggregate in `fn_global_ranking` / `fn_pool_leaderboard` (SECURITY DEFINER read RPCs) returning ranked rows (nickname/avatar/points) without exposing individual score rows. **Pool leaderboard ranks the pool's active members by their GLOBAL points** (members with 0 included); membership required (`NOT_MEMBER`).
- **Alternatives:** materialized ranking table + triggers (rejected for v1 — query is cheap at scale); client aggregation (impossible under RLS for global).
- **Consequences:** consistent with `fn_discover_pools`; RLS-safe; no per-row leakage. Live projection deferred. If per-pool distinct predictions are added later, `fn_pool_leaderboard` switches to summing `pool_id = p_pool` scores.
