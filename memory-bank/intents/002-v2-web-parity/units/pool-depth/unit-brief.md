# Unit: Pool Depth

> Intent 002 (v2). Mirrors web Units 10/44/45/47/53/54/55/56/61/65 + FR-REFINE-41.

## Purpose
Everything that makes pools rich beyond v1's create/join/manage: directed invites, owner controls, the predictions-in-pool grid, and membership-scoped scoring.

## In scope
FR-PD1 directed invites by email/nickname (+ typeahead) · FR-PD2 members-can-invite toggle · FR-PD3 rename pool · FR-PD4 change visibility · FR-PD5 archive + settings panel · FR-PD6 predictions-in-pool grid (hide-future masking + pre-join cells) · FR-PD7 membership-scoped pool leaderboard (kickoff ≥ joined, override else global).

## Out of scope
Global leaderboard (v1); live projection (Realtime unit) though the grid consumes it.

## Integrations
`pool_directed_invites` table + `create-directed-invite` fn + `search-nicknames` RPC; `rename-pool`/`set-pool-visibility`/`set-pool-members-can-invite`/`archive-pool` Edge Functions; **masked pool-predictions RPC** (SECURITY DEFINER hides others' future picks); **membership-scoped leaderboard RPC**; emits invite notification events.

## Dependencies
Depends on: Pools (v1), Predictions pool-overrides (grid shows pool picks), Notifications (invite events), Realtime (live grid/banner). Provides: full pool experience.

## Native module
None (pure JS/backend).

## Risk
Server-side masking correctness (never leak a future pick); membership-scoped scoring rule (kickoff ≥ joined, override else global) is subtle — mirror the web exactly.

## Stories
`stories/` (US-PD1…PD7).
