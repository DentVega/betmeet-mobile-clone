# Unit: Leaderboard & Rankings

> Part of Intent 001 — Betmeet Mobile v1. Mirrors web `src/features/scoring-rankings`.

## Purpose
Display standings: a global ranking and a per-pool leaderboard. Purely read-only — scoring is computed server-side.

## In scope (v1)
- Global ranking: rank, nickname, avatar, total points; highlight viewer; live projection when matches in progress (FR-L1).
- Per-pool leaderboard of members by pool points (FR-L2).
- Read-only display + refetch on focus (FR-L3).

## Out of scope (v1)
- Any client-side scoring/computation (`computeScore`, sweeper stay server-side).
- Historical/per-round breakdowns beyond what the existing queries return.

## Requirements covered
FR-L1 … FR-L3. (Backend mirror: web scoring-rankings unit, FR-REFINE-36.*)

## Screens
Global Rankings (tab) · Pool Leaderboard (reached from Pool detail).

## Key integrations
- Reads only: `getGlobalRankingProjection`, `getPoolLeaderboard` (PostgREST selects / RPC for the live projection).
- FlashList for both lists; client cache with focus refetch.

## Dependencies
- **Depends on:** Auth session; Pools (pool context for per-pool board); Predictions (scores derive from predictions).
- **Provides:** nothing downstream (leaf unit).

## Topology
Host bundle in v1; lazy-load-friendly federated-remote candidate later.

## Risk notes
- Lowest write risk (no writes). Main check: is the "live projection" available as a callable query/RPC, or is it server-action/RSC-only (class 3)?
- Build last — depends on predictions producing scores and pools existing.

## Stories
See `stories/` (US-L1 … US-L3).
