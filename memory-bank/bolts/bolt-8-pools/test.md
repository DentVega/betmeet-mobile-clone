# Bolt 8 — Stage 5: Test (Pools)

## Static / mobile
- `tsc --noEmit` — clean.
- `jest` — 51/51 (no new unit tests; pools logic is data/UI + server functions).
- Re.Pack/Rspack android bundle → **exit 0** (~4.9 MB).

## Backend — pool functions on ephemeral PG17 (9 migrations applied)
Exercised the full lifecycle with simulated `auth.uid()`:
```
create: OK ; u2 join: OK
owner leave: OK (OWNER_CANNOT_LEAVE)     ← owner blocked
nonowner kick: OK (NOT_OWNER)            ← only owner kicks
owner kick u2: OK ; members after kick = 1
discover (as non-member U3): name=Liga A count=1 is_member=false   ← counts without leaking members
nonowner delete: OK (NOT_OWNER)          ← only owner deletes
owner delete: OK ; pools after delete = 0 (cascade)
```
All ownership/capacity/visibility rules confirmed; `fn_discover_pools` returns aggregate count + is_member for a non-member (RLS-safe).

## Not covered here (needs deploy + device)
- Live invoke of leave/kick/delete + discover RPC against the real project — after `db push` (pool migration) + `functions deploy leave-pool kick-member delete-pool`.
- Deep-link join E2E (`betmeet://pools/join/TOKEN` → PoolJoin → join → PoolDetail) on device.
- RNTL component tests deferred.

## User action
`supabase db push` (pool_functions migration) + `supabase functions deploy leave-pool kick-member delete-pool`. (create-pool/join-pool already deployed.)
