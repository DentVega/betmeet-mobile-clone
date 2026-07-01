# Bolt V6 — Pool Depth (mobile) — Outcome

- **Status:** ✅ Complete (tsc/jest clean; core screens verified on device)
- **Intent:** 002-v2-web-parity · unit `pool-depth` (mobile) + `predictions-pool-overrides` (FR-PP1) · Stories US-PD1…PD7, US-PP1
- **DDD:** Model → Design+ADR-021 → Implement → Test (checkpoints approved)

## What shipped
- **Data** (`poolDepthApi` + `usePoolDepth`) — all via `supabase.rpc` (V5): searchNicknames, createInvite, respondInvite, renamePool, setVisibility, setMembersCanInvite, archivePool; `useMyInvites`, `usePoolPredictions`.
- **Screens**
  - `PoolSettingsScreen` (owner) — rename, visibility Switch, members-can-invite Switch, archive/unarchive.
  - `PoolInviteScreen` — nickname typeahead (debounced) → send invite.
  - `PoolPredictionsScreen` — masked grid (members × matches, joined with the cached fixture for team names); own upcoming row opens the override form.
  - `PendingInvites` (PoolsList) — Accept/Decline.
  - `PoolDetailScreen` — buttons: Predicciones, Invitar (owner/member+flag), Ajustes (owner).
- **FR-PP1** — `PredictionForm` gains `poolId` + "also save as global" toggle → pool-scoped override via `save-prediction`.
- **Nav** — PoolSettings/PoolInvite/PoolPredictions routes; `usePoolDetail` now selects `members_can_invite` + `archived_at`.
- i18n `pools.*` additions.

## ADR
ADR-021 — nickname-first invites; direct-RPC data layer (matches ADR-020).

## Verification
tsc/jest clean. Device: PoolsList (invites hidden when empty), create pool, PoolDetail (all new buttons), Invite (typeahead), Settings (rename + switches + archive, live data). Grid/override rely on the V5-validated masking RPC + save-prediction poolId support.

## Carried forward
- Cross-account invite E2E (needs a 2nd test user).
- Pool-leaderboard **live** projection (deferred follow-up; extends V4).
- Invite **notifications** → V10.

## Activation
None new (all V5 RPCs already deployed; V6 is client-only). No `db push` / `functions deploy`.

## Next
Bolt V7 — Account & Security (non-native): change email/password, delete account, MFA, linked providers.
