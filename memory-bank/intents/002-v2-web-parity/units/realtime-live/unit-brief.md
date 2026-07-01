# Unit: Realtime & Live

> Intent 002 (v2). Mirrors web Units 58/61/62 (Supabase Realtime, live banners, live projection).

## Purpose
Live updates across matches, pools, and leaderboards via Supabase Realtime, plus client-side live point/rank projection.

## In scope
FR-RT1 `useLiveResults` (Realtime subscribe → invalidate) · FR-RT2 live match status/scoreline in the fixture · FR-RT3 "live now" banner in pools · FR-RT4 live leaderboard projection (confirmed + Σ computeScore(pick,liveScore), reorder, deltas ▲/▼).

## Out of scope
The data source (results are entered manually — Results unit); the socket transport internals.

## Integrations
Supabase Realtime (Postgres Changes on `matches`/`prediction_scores`, or Broadcast from the sweeper — Q4); TanStack Query invalidation; the client scoring function (ported from Bolt 4 for projection only).

## Dependencies
Depends on: Results & Auto-scoring (produces the changes), Matches/Pools/Leaderboard (v1 screens to enhance). Provides: liveness to all three.

## Native module
None (pure JS over supabase-js Realtime).

## Risk
Projection math must match server scoring exactly; socket lifecycle (reconnect, background) with focus-refetch fallback (NFR-4).

## Stories
`stories/` (US-RT1…RT4).
