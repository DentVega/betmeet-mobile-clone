# Bolt 9 — Leaderboard & Rankings — Outcome (FINAL v1 bolt)

- **Status:** ✅ Complete (code; needs `db push` for the ranking migration, then device verify)
- **Intent:** 001-mobile-v1-migration · Phase C
- **DDD:** Model → Design+ADR-015 → Implement → Test (approved)
- **Stories:** US-L1…L3

## What shipped
Read-only standings:
- **Backend** (`20260630170000_ranking_functions.sql`): `fn_global_ranking(limit)` + `fn_pool_leaderboard(pool)` — SECURITY DEFINER read RPCs aggregating `prediction_scores` (RLS-safe), `rank()` ties; pool leaderboard requires membership and ranks members by global points (0 included).
- **Mobile** `src/leaderboard/`: `RankingsScreen` (Rankings tab, replaces placeholder), `PoolLeaderboardScreen` (from PoolDetail), `RankRow` (memoized, viewer-highlighted), `useGlobalRanking`/`usePoolLeaderboard` (rpc). FlashList; focus refetch. `leaderboard.*` i18n. Wired the PoolDetail "leaderboard" button + the new `PoolLeaderboard` route.

## ADRs
ADR-015 — ranking RPCs (RLS-safe) + pool ranks by global points (v1).

## Verification
- `tsc` clean; `jest` 51/51; android bundle exit 0.
- RPCs validated on ephemeral PG17 (10 migrations): global rank ordering, pool leaderboard includes 0-point members, NOT_MEMBER enforced.

## User action
`supabase db push` (ranking_functions migration). No new Edge Functions (read RPCs).

## Carried forward / v2
- Live projection for in-progress matches.
- Per-pool distinct predictions (would switch pool leaderboard to pool-scoped scores).
- RNTL component tests.

## 🏁 v1 feature-complete
All 10 bolts (0–9) done. See `memory-bank/progress.md` for the activation checklist (db push of all migrations, deploy of all functions, native rebuild for FlashList, dashboard redirect URLs + avatars bucket).
