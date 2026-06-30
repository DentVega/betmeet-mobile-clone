# ADR-014 — Pool membership functions + discover read-RPC

- **Status:** Accepted (Bolt 8)
- **Context:** Leave/kick/delete carry ownership rules and write `pool_memberships`/`pools` (no client write RLS). Discover must show member counts of **public pools the caller isn't in** — but the `pool_memberships` RLS only lets co-members see each other, so a plain count would be blocked / leak identities.
- **Decision:**
  - **`fn_leave_pool` / `fn_kick_member` / `fn_delete_pool`** — plpgsql SECURITY DEFINER, authorize via `auth.uid()` (owner-cannot-leave; only-owner kick/delete), wrapped by `leave-pool` / `kick-member` / `delete-pool` Edge Functions.
  - **`fn_discover_pools`** — SECURITY DEFINER read RPC returning public pools + aggregate `member_count` + `is_member`, **without exposing member rows**. Called directly via `supabase.rpc` from mobile.
- **Alternatives:** denormalized `pools.member_count` via triggers (rejected for v1 — more moving parts; the count query is cheap at this scale); RLS UPDATE policy for self-leave (rejected — owner-leave rule + kick/delete still need functions, keep them together).
- **Consequences:** Membership mutations confined to audited functions; discover gets counts without leaking who's in a pool. create/join continue using the Bolt 4 functions. Re-join after leave: a left membership is deleted (not archived), so re-joining is a fresh insert — no stale-row conflict.
