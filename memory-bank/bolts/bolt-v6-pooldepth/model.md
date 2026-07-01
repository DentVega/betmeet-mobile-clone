# Bolt V6 — Stage 1: Model (Pool Depth — mobile)

> Intent 002 · unit `pool-depth` (mobile half) + `predictions-pool-overrides` (FR-PP1). Consumes the V5 RPCs. Largest client bolt of v2.

## Ubiquitous language (UI)
- **Invite (send)** — from a pool, an owner/permitted member searches a nickname (typeahead) and sends a directed invite.
- **Invite (receive)** — a pending-invites section lists invites for me with Accept/Decline.
- **Pool settings** — owner-only panel: rename, visibility (PUBLIC↔PRIVATE), members-can-invite, archive.
- **Predictions grid** — members × matches, masked per the server (others' future picks hidden; pre-join empty).
- **Pool override** — from the grid, a member edits their pick *for this pool* (distinct from global), optionally also saving it as global.

## Deliverables
- **Data** (`src/pools/data/poolDepthApi.ts` + hooks) — all via `supabase.rpc` (V5): `searchNicknames`, `createInvite`, `respondInvite`, `renamePool`, `setVisibility`, `setMembersCanInvite`, `archivePool`; `useMyInvites()` (pending for me), `usePoolPredictions(poolId)`.
- **Screens**
  - `PoolSettingsScreen` (owner) — rename / visibility / members-can-invite / archive.
  - `PoolInviteScreen` — nickname typeahead + send.
  - `PoolPredictionsScreen` — masked grid (per day, members' effective picks + points; own upcoming → editable).
  - `PoolsListScreen` — a **pending invites** section (Accept/Decline).
  - `PoolDetailScreen` — action buttons: Predicciones, Invitar (owner or member+flag), Ajustes (owner).
- **FR-PP1** — extend `PredictionForm` with optional `poolId` + "also save as global" toggle; opened scoped from the grid.
- **Nav** — add `PoolSettings`, `PoolInvite`, `PoolPredictions` to `PoolsStackParamList`.
- **i18n** — `pools.*` additions.

## Reuse / already done
- Scoped **pool leaderboard** already returns membership-scoped values (V5 rework) — `PoolLeaderboardScreen` unchanged, now correct.
- `save-prediction` already accepts `poolId` + `alsoSaveAsGlobal`.
- `pools.members_can_invite`, invite RPCs, masking RPC all exist (V5).

## Invariants
- The client never decides masking/permission — it renders what the RPCs return; owner-only controls are also guarded server-side.
- Override save goes through `save-prediction` (lock guard + validation server-side).

## Out of model
Pool-leaderboard **live** projection (deferred — extends V4; optional follow-up); invite **notifications** (V10); invite by raw email UI (nickname-first now; email path exists in the RPC but UI is nickname typeahead).
