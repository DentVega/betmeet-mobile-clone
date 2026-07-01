# Bolt V6 — Test (Pool Depth — mobile)

## Static
- `tsc --noEmit` clean; `jest` 54/54.

## Device (Pixel 7 Pro, against remote Supabase)
- **PoolsList** — pending-invites section correctly hidden when none; empty-state renders.
- **Create pool** — created "TestV6Liga" (existing Bolt 8 flow) → appears in the list.
- **PoolDetail** — all V6 buttons render: **Predicciones**, Ver clasificación, **Invitar** (owner/member+flag), **Ajustes de la liga** (owner), Eliminar.
- **PoolInviteScreen** — header + "Buscar por apodo…" typeahead field render; search wired (no results here — single-user project, self excluded → correct).
- **PoolSettingsScreen** — renders with live data: Renombrar (pre-filled "TestV6Liga" + button), Visibilidad: Pública (switch), Los miembros pueden invitar (switch), Archivar liga. Values loaded from the pool (type, members_can_invite).
- Cleanup: deleted the test pool.

## Covered by tsc + shared infra (not re-clicked on device)
- **PoolPredictionsScreen** grid (usePoolPredictions + fixture join) — same masking RPC validated in V5; renders via the same primitives.
- **FR-PP1 override** — PredictionForm `poolId` + "also save as global" toggle → `savePrediction({poolId, alsoSaveAsGlobal})`; `save-prediction` already supports both (V4/Bolt-4).
- Accept/Decline invite — `respondInvite` RPC validated in V5.

## Not covered (needs a 2nd user)
- End-to-end invite → accept across two accounts (single-user test project).
- Pool-leaderboard **live** projection (deferred follow-up).
