# Bolt V6 — Stage 2: Design + ADR-021 (Pool Depth — mobile)

## ADR-021 — Nickname-first invites; direct RPC data layer
- Invite UI is **nickname typeahead** (`fn_search_nicknames` → `fn_create_directed_invite` with `invitee_user_id`). The email path exists in the RPC but is not surfaced yet.
- All pool-depth writes/reads go through `supabase.rpc` in a `poolDepthApi` module (matches the V5 direct-RPC decision, ADR-020). No Edge Functions.

## Data — `src/pools/data/poolDepthApi.ts`
`searchNicknames(prefix)`, `createInvite(poolId, inviteeUserId)`, `respondInvite(inviteId, accept)`, `renamePool(poolId,name)`, `setVisibility(poolId,type)`, `setMembersCanInvite(poolId,val)`, `archivePool(poolId,val)` — each `supabase.rpc(...)` returning `{ok,code?}`.
Hooks (in `usePools.ts` or new `usePoolDepth.ts`):
- `useMyInvites()` — `pool_directed_invites` where invitee=me & PENDING, join pool name + inviter nick (RLS-allowed).
- `usePoolPredictions(poolId)` — `fn_pool_predictions` → flat rows grouped by match for the grid.

## Screens
- **`PoolSettingsScreen`** (owner) — rename (TextField+Save), visibility pill (PUBLIC/PRIVATE), members-can-invite Switch, Archive button. Errors via `tr('pools.errors.*')`.
- **`PoolInviteScreen`** — search TextField → results list (Avatar+nick) → tap = send invite; success/AlREADY_* feedback.
- **`PoolPredictionsScreen`** — per-day sections; each match shows members' effective picks (masked → "—"/lock icon) + points; the viewer's own upcoming row opens `PredictionForm` scoped to the pool.
- **`PoolsListScreen`** — pending-invites banner section (pool name, inviter, Accept/Decline).
- **`PoolDetailScreen`** — buttons: Predicciones (all), Invitar (owner or member+members_can_invite), Ajustes (owner). Uses `pool.members_can_invite` (add to detail select).

## FR-PP1 — `PredictionForm`
Optional `poolId?: string` prop; when set, `savePrediction({..., poolId, alsoSaveAsGlobal})` with an "also save as global" toggle; invalidates `['fixture']` + `['poolPredictions', poolId]`.

## Nav
`PoolsStackParamList` += `PoolSettings:{poolId}`, `PoolInvite:{poolId}`, `PoolPredictions:{poolId}`.

## i18n
`pools.settings/rename/visibility/mci/archive/invite/search/sendInvite/invited/pendingInvites/accept/decline/predictions/masked/alsoGlobal/override` + error codes (NOT_ALLOWED/ALREADY_MEMBER/ALREADY_INVITED).

## Test
tsc + jest; device: settings (rename/visibility/toggle/archive), invite typeahead + send, pending-invite accept, predictions grid masking, pool override save.
