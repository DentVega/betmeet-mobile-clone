# Bolt 9 — Stage 2: Design + ADR-015 (Leaderboard)

> Read-only standings. 1 migration (2 RPCs) + mobile screens. Final v1 bolt.

## ADR-015 — Ranking via SECURITY DEFINER RPCs; pool ranks by global points
- **Decision:** Aggregate rankings in `fn_global_ranking` / `fn_pool_leaderboard` (SECURITY DEFINER read RPCs) — RLS on `prediction_scores` (own + pool-peers) blocks client-side cross-user aggregation. Pool leaderboard ranks the pool's **members by their global points** (v1 has global-only predictions); `fn_pool_leaderboard` requires membership.
- **Alternatives:** materialized ranking table + triggers (rejected for v1 — the aggregate query is cheap at this scale); client-side aggregation (impossible under RLS for global).
- **Consequences:** consistent with `fn_discover_pools`; no per-row score leakage; live projection deferred.

## Backend — migration `20260630170000_ranking_functions.sql`
- `fn_global_ranking(p_limit int) returns table(user_id, nickname, avatar_url, total_points, rank)` — sum of global-scope (`pool_id is null`) `prediction_scores` per user, joined to `profiles`, `rank() over (order by pts desc)`, limit.
- `fn_pool_leaderboard(p_pool uuid) returns table(...)` — plpgsql; `if not is_pool_member(p_pool, auth.uid()) then raise NOT_MEMBER`; all active members LEFT JOIN their global scores → `coalesce(sum,0)` ranked (members with 0 included).
- `grant execute … to authenticated`.

## Mobile — `src/leaderboard/`
```
data/useRankings.ts   # useGlobalRanking() + usePoolLeaderboard(poolId) via supabase.rpc (TanStack Query)
screens/RankingsScreen.tsx       # Rankings tab (global), FlashList, viewer highlighted, focus refetch
screens/PoolLeaderboardScreen.tsx# per-pool, from PoolDetail
components/RankRow.tsx            # memoized: rank · avatar · nickname · points (highlight if mine)
```
- Nav: add `PoolLeaderboard{poolId}` to `PoolsStackParamList` + AppTabs PoolsStack; wire PoolDetail's leaderboard button → `navigate('PoolLeaderboard', {poolId})`. Replace the Rankings tab placeholder with `RankingsScreen`.
- `leaderboard.*` i18n (es/en). Viewer highlight via `useSessionStore.userId`.

## Test
- Backend on ephemeral PG17: seed users + finished match + global predictions → `compute-score`-equivalent rows → `fn_global_ranking` ranks by points; `fn_pool_leaderboard` requires membership + ranks members (0 included). (Insert `prediction_scores` rows directly in the test since compute-score is Deno.)
- Mobile: tsc + jest + bundle.
