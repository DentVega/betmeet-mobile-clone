# Bolt 8 — Stage 2: Design (Pools)

> Implements the Stage-1 model. Backend: 1 migration (4 fns) + 3 Edge Functions. Mobile: expand the Pools stack to 5 screens. Choice → ADR-014.

## Backend — migration `20260630160000_pool_functions.sql`
plpgsql, SECURITY DEFINER, `auth.uid()`, `grant execute to authenticated`:
- `fn_leave_pool(p_pool uuid)` — must be a member; **owner → `OWNER_CANNOT_LEAVE`**; delete the caller's membership.
- `fn_kick_member(p_pool uuid, p_user uuid)` — caller must be `owner_id` else `NOT_OWNER`; `p_user <> owner`; delete target membership.
- `fn_delete_pool(p_pool uuid)` — caller must be owner else `NOT_OWNER`; `delete from pools where id=p_pool` (FK cascade removes memberships + pool predictions).
- `fn_discover_pools(p_query text, p_only_open boolean, p_limit int, p_offset int) returns table(id uuid, name text, type text, capacity int, member_count bigint, is_member boolean)` — public pools `ilike '%query%'`, ordered by name, paginated; `p_only_open` drops full pools. Aggregate count without exposing member rows.

Edge Functions (writes, verify_jwt=true): `leave-pool`, `kick-member`, `delete-pool` → wrap the fns (error map: OWNER_CANNOT_LEAVE, NOT_OWNER, NOT_FOUND). Discover is a direct `supabase.rpc('fn_discover_pools', …)` read. config.toml updated.

## Mobile — `src/pools/`
```
data/
  poolsApi.ts     # functions.invoke: createPool, joinPool({poolId}|{token}), leavePool, kickMember, deletePool
  usePools.ts     # TanStack Query: my pools (RLS) with member counts
  useDiscover.ts  # rpc fn_discover_pools (query/onlyOpen/page)
  usePoolDetail.ts# RLS read: pool + owner + members (profiles)
screens/
  PoolsListScreen.tsx   # FlashList of my pools; buttons → New / Discover; tap → Detail
  PoolNewScreen.tsx     # form (name/capacity/type) → create-pool → Detail
  PoolDiscoverScreen.tsx# search box + FlashList (member_count, Join) → join-pool → Detail
  PoolDetailScreen.tsx  # header, copy invite token, members, leave/kick/delete, links to Leaderboard/Matches
  PoolJoinScreen.tsx    # from deep link {token}: join-pool by token → Detail (handles parked intent)
```
Reuse `ui/{TextField,Button,Screen}` + FlashList (Bolt 7). New `pools.*` i18n (es/en).

## Navigation
Expand `PoolsStackParamList`: `PoolsList | PoolNew | PoolDiscover | PoolDetail{poolId} | PoolJoin{token}`. `AppTabs` PoolsStack registers all five. The deep-link router already targets `Pools → PoolJoin {token}` (Bolt 0); PoolJoin invokes join-pool then `navigation.replace('PoolDetail', {poolId})`.

## Reads (RLS)
- My pools: `pool_memberships?user_id=eq.me&archived_at=is.null&select=pool:pools(*, members:pool_memberships(count))` — I'm a member so the embedded count is visible.
- Detail: `pools?id=eq.X&select=*,owner:profiles!pools_owner_id_fkey(nickname_base,nickname_discriminator,avatar_url),members:pool_memberships(user:profiles(nickname_base,nickname_discriminator,avatar_url),joined_at)`.
- Discover: rpc (counts of non-member public pools).

## Invalidation
create/join/leave/kick/delete → invalidate `['pools']` (+ `['pool', id]`, `['discover']` as relevant). Copy invite token = `Clipboard` (no dep — use `@react-native-clipboard/clipboard`? avoid native dep: use `Share`/selectable text). v1: render the token as selectable text + a "copied" affordance via the RN `Clipboard` from `@react-native-clipboard/clipboard` is native; instead show the token in a selectable `TextInput`-readonly to copy manually (no new native dep).

## ADR-014
Pool membership functions (leave/kick/delete) + `fn_discover_pools` SECURITY DEFINER read for counts (RLS hides member rows of non-member pools).

## Test surface
- Backend on ephemeral PG17 (apply all migrations): `fn_create_pool`→`fn_join_pool` set up a pool; `fn_leave_pool` (owner blocked / member ok); `fn_kick_member` (non-owner blocked / owner ok); `fn_delete_pool` (non-owner blocked / owner ok + cascade); `fn_discover_pools` returns count + is_member.
- Mobile: tsc + jest + bundle. Pure helpers minimal (mostly data/UI). RNTL deferred.
