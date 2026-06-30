# Bolt 8 — Stage 1: Model (Pools)

> Phase C mobile bolt. Full pool lifecycle: list, create, discover/join, join-by-token (incl. deep link), detail, membership management. Reuses Bolt 4 `create-pool`/`join-pool`; adds the leave/kick/delete functions + a discover read-RPC. Traces to `units/pools/` (US-P1…P6).

## Operations
| Op | Path | Notes |
|---|---|---|
| **My pools** (US-P1) | RLS read | member of → RLS lets me read those pools + memberships + member counts (I'm a member). |
| **Create** (US-P2) | `create-pool` fn (Bolt 4) | name 3–60, capacity 2–100, token gen. |
| **Discover + join public** (US-P3) | **`fn_discover_pools` RPC** (read) + `join-pool` fn | discover needs member counts of pools I'm NOT in → RLS hides those member rows, so a SECURITY DEFINER RPC returns public pools + member_count + is_member; join via existing fn. |
| **Join by token / deep link** (US-P4) | `join-pool` fn (by token) | `betmeet://pools/join/TOKEN` already routes to the PoolJoin screen (Bolt 0 parking). |
| **Pool detail** (US-P5) | RLS read | for a pool I'm in: pool + memberships + member profiles (RLS). Copy invite token (client). Links to leaderboard (Bolt 9) + matches. |
| **Leave / kick / delete** (US-P6) | **new fns** `fn_leave_pool` / `fn_kick_member` / `fn_delete_pool` | owner can't leave; only owner kicks/deletes; pool_memberships has no client write RLS → functions (SECURITY DEFINER + auth.uid()). |

## Backend additions (this bolt)
Migration `20260630160000_pool_functions.sql`:
- `fn_leave_pool(p_pool)` — caller leaves; **owner cannot leave** (`OWNER_CANNOT_LEAVE`); delete (or archive) their membership.
- `fn_kick_member(p_pool, p_user)` — caller must be owner (`NOT_OWNER`); can't kick self; remove target membership.
- `fn_delete_pool(p_pool)` — caller must be owner; delete pool (cascade removes memberships/pool-scoped predictions).
- `fn_discover_pools(p_query, p_only_open, p_limit, p_offset)` — read RPC (SECURITY DEFINER): public pools matching `p_query`, with `member_count`, `capacity`, `is_member`; `p_only_open` filters out full ones. Returns counts without exposing member rows.
Edge Functions (writes): `leave-pool`, `kick-member`, `delete-pool` (JWT). Discover is a direct `supabase.rpc('fn_discover_pools', …)` read.

## Why a discover RPC (RLS nuance)
`pool_memberships` RLS only lets co-members see each other → a non-member can't count members of a public pool to display "12/20". `fn_discover_pools` (DEFINER) returns the aggregate count safely without leaking member identities.

## Mobile shape
Expand the Bolt 0 Pools stack: **PoolsList → PoolNew → PoolDiscover → PoolDetail → PoolJoin**. TanStack Query for reads (my pools, discover, detail); `functions.invoke` for create/join/leave/kick/delete; invalidate `['pools']`/`['pool',id]` on mutation. Deep-link `poolJoin` lands on PoolJoin → calls `join-pool` by token → on success navigate to PoolDetail.

## Invariants
- Owner cannot leave; only the owner kicks/deletes (server-enforced).
- Capacity + duplicate handling stay in `join-pool` (idempotent already-member).
- Member counts/identities respect RLS; discover exposes counts only.
- All mutations authorize via `auth.uid()`; nothing trusts client-supplied ids.

## Out of model
Directed invites by email/nickname (v2). Pool-scoped predictions UI surface ties into Matches (poolId) — minimal in v1 (global predictions remain the default tab). Leaderboard rendering → Bolt 9.
