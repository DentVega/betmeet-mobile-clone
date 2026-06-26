# Unit: Pools

> Part of Intent 001 — Betmeet Mobile v1. Mirrors web `src/features/pools`.

## Purpose
Create and manage prediction leagues ("pools"): list memberships, create, discover/join public pools, join private pools by token (incl. deep link), view detail, and manage membership.

## In scope (v1)
- My pools list (FR-P1).
- Create pool — name ≤60, capacity, public/private (FR-P2).
- Discover/search public pools with pagination + join (anytime) (FR-P3).
- Join by token incl. `betmeet://pools/join/TOKEN` deep link (FR-P4).
- Pool detail: header, copy invite token, link to leaderboard, quick link to matches (FR-P5).
- Membership management: leave; owner kick/delete (anytime) (FR-P6).
- Capacity + duplicate-membership enforcement surfaced from server (FR-P7).

## Out of scope (v1)
- Directed invites by email/nickname (web Unit 10) → v2.
- `membersCanInvite` advanced controls → keep server default; no v1 UI.

## Requirements covered
FR-P1 … FR-P7. (Backend mirror: web FR-REFINE-23.*)

## Screens
Pools list · New pool · Discover (search/paginate) · Pool detail · Join-by-token landing.

## Key integrations
- Reads: `getMyPools`, `listPublicPools`, `getPoolDetail` (PostgREST selects).
- Writes: `createPool`, `joinPublicPool`, `joinPoolByToken`, `leavePool`, `kickMember`, `deletePool` — **all server actions today → write-path audit is the gating task for this unit.**
- Deep-link router for token join (parks intent through auth/onboarding).

## Dependencies
- **Depends on:** Auth session; App-shell deep-link router + tabs + data layer.
- **Provides:** pool context to Leaderboard (per-pool ranking).

## Topology
Host bundle in v1; good federated-remote candidate later.

## Risk notes
- Highest concentration of class-3 write paths (owner-only mutations, capacity/duplicate logic). This unit owns the **write-path audit ADR** that de-risks the whole migration.

## Stories
See `stories/` (US-P1 … US-P6).
