# Unit: Predictions — Pool Overrides

> Intent 002 (v2). Mirrors web Unit 48 (per-pool prediction override) + FR-REFINE-36 (penalty bonus).

## Purpose
Let a member set a per-pool prediction distinct from their global pick, and confirm the knockout penalty-shootout bonus surfaces in the UI.

## In scope
FR-PP1 per-pool prediction overrides (`predictions.pool_id`) — UI + reads; FR-PP2 knockout penalty-winner bonus (already in scoring) surfaced.

## Out of scope
Global prediction flow (v1, done); the pool grid presentation (Pool Depth unit).

## Integrations
`save-prediction` Edge Function already accepts `poolId` + `alsoSaveAsGlobal` (Bolt 4); fixture read gains pool-scope; scoring already handles penalty bonus.

## Dependencies
Depends on: Matches/Predictions (v1), Pool Depth (surfaces overrides in the grid), membership-scoped leaderboard (consumes overrides). Provides: per-pool picks.

## Native module
None.

## Risk
Clear UX for "global vs this pool" so users understand which pick applies where; the backend already supports the dual write.

## Stories
`stories/` (US-PP1…PP2).
