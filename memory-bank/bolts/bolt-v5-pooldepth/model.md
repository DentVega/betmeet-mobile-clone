# Bolt V5 — Stage 1: Model (Pool Depth — backend)

> Intent 002 · unit `pool-depth` (backend half). Traces to US-PD1…PD7 (+ FR-PP1 reads). All SQL: tables, RLS, functions/RPCs. V6 builds the UI.

## Existing (reconciled)
`pools` has `type` ('PUBLIC'|'PRIVATE'), `members_can_invite` (default true), unique public name; **no `archived_at`**. `pool_memberships` has `joined_at`, `archived_at`, unique(pool,user). `predictions` has `pool_id` (null = global; = pool = override). `prediction_scores` scores **all** predictions (global + pool). `is_pool_member(pool,uid)` helper + `fn_pool_leaderboard` (ranks by GLOBAL points — to be reworked).

## Ubiquitous language
- **Directed invite** — an owner/permitted-member invites a specific user (by nickname or email) → `pool_directed_invites` row (PENDING); the invitee accepts → joins.
- **Members-can-invite** — pool flag: whether non-owner members may send invites.
- **Owner controls** — rename, change visibility (PUBLIC↔PRIVATE), archive, set members-can-invite.
- **Effective prediction** — for a (member, match, pool): the pool **override** (`pool_id = pool`) if present, else the member's **global** pick (`pool_id null`).
- **Membership-scoped leaderboard** — a member's pool total = Σ scores of their *effective* prediction over matches with `kickoff_at ≥ their joined_at`.
- **Masked predictions grid** — members see each other's picks per match **only once the match is locked** (kickoff passed); future picks of *others* are hidden; a member's own picks always visible; matches before a member's `joined_at` are empty ("not in pool yet").

## Deliverables (one migration; RPCs, not Edge Functions)
Writes are `SECURITY DEFINER` + `auth.uid()` (no service role) → called via `supabase.rpc` directly (like the existing read RPCs). **No new Edge Functions** (ADR).
1. `alter pools add archived_at timestamptz`.
2. **`pool_directed_invites`** (id, pool_id, inviter_id, invitee_user_id?, invitee_email?, status enum PENDING/ACCEPTED/DECLINED/CANCELLED, created_at, responded_at) + RLS (inviter/invitee/owner can see) + unique(pool, invitee_user_id) partial where PENDING.
3. **`fn_search_nicknames(prefix, limit)`** — typeahead over profiles (nickname/avatar/id), min prefix len, excludes deleted; SECURITY DEFINER.
4. **`fn_create_directed_invite(pool, invitee_user_id | invitee_email)`** — permission (owner OR member+members_can_invite), capacity, not-already-member/invited → insert PENDING.
5. **`fn_respond_invite(invite_id, accept bool)`** — invitee only; accept → membership insert (capacity re-check); mark responded.
6. **`fn_rename_pool(pool, name)`** — owner; public-name uniqueness.
7. **`fn_set_pool_visibility(pool, type)`** — owner; uniqueness guard when → PUBLIC.
8. **`fn_set_members_can_invite(pool, bool)`** — owner.
9. **`fn_archive_pool(pool, archived bool)`** — owner; archived pools excluded from discover/active lists.
10. **`fn_pool_predictions(pool)`** — member-only; per (member, match) effective prediction + score, **masked** (others' picks hidden until kickoff; pre-join → null).
11. **rework `fn_pool_leaderboard(pool)`** — membership-scoped + effective prediction (FR-PD7).
12. Update `fn_discover_pools` to exclude `archived_at is not null`.

## Invariants
- Masking + permission + scoping enforced server-side; clients cannot read others' future picks or bypass owner checks.
- Effective prediction = override else global — one rule, used by both the grid and the leaderboard.
- Capacity honored on invite-accept and direct join.

## Out of model
All mobile UI (V6); pool-leaderboard **live** projection (V6, extends V4); notification on invite (V10).
