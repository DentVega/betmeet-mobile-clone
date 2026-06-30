# Bolt 8 — Pools — Outcome

- **Status:** ✅ Complete (code; needs `db push` + deploy of 3 functions, then device verify)
- **Intent:** 001-mobile-v1-migration · Phase C
- **DDD:** Model → Design → ADR-014 → Implement → Test (checkpoints approved)
- **Stories:** US-P1…P6

## What shipped
Full pool lifecycle:
- **Backend** (`20260630160000_pool_functions.sql`): `fn_leave_pool` (owner blocked), `fn_kick_member` / `fn_delete_pool` (owner-only), `fn_discover_pools` (SECURITY DEFINER read — public pools + member_count + is_member without leaking members). Edge Functions `leave-pool` / `kick-member` / `delete-pool` (JWT) + config.
- **Mobile** `src/pools/`: 5 screens (PoolsList, PoolNew, PoolDiscover, PoolDetail, PoolJoin) in the expanded Pools stack; `poolsApi` (create/join/leave/kick/delete via functions.invoke), `usePools`/`useDiscover`/`usePoolDetail` (TanStack Query: RLS reads + discover RPC). `pools.*` i18n (es/en). FlashList for lists; invite token shown as selectable text (no clipboard dep).
- Deep-link `pools/join/TOKEN` → PoolJoin → join-by-token → `replace('PoolDetail')`.

## ADRs
ADR-014 — pool membership functions + discover read-RPC (RLS-safe counts).

## Verification
- `tsc` clean; `jest` 51/51; android bundle exit 0 (4.9 MB).
- Pool functions validated on ephemeral PG17 (9 migrations): OWNER_CANNOT_LEAVE, NOT_OWNER (kick/delete), owner kick OK, discover count+is_member for a non-member, delete cascade → 0 pools.

## User action
`supabase db push` (pool_functions) + `supabase functions deploy leave-pool kick-member delete-pool`. (create-pool/join-pool already live.)

## Carried forward
- Directed invites by email/nickname → v2.
- Pool-scoped predictions surfaced from PoolDetail (a "predict for this pool" entry) — minimal in v1; the save-prediction function already supports `poolId`.
- Leaderboard link from PoolDetail → wired in Bolt 9.
- RNTL component tests deferred.

## Next
Bolt 9 — Leaderboard & Rankings (final v1 bolt): global ranking + per-pool leaderboard (reads of scoring output).
