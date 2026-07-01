# Bolt V5 — Stage 2: Design + ADR-020 (Pool Depth — backend)

## ADR-020 — Pool-depth writes as direct SECURITY DEFINER RPCs (no Edge Functions)
- **Decision:** expose all new pool-depth operations as `SECURITY DEFINER` plpgsql functions checking `auth.uid()`, called via `supabase.rpc` from the client (like the existing read RPCs). No new Edge Functions.
- **Rationale:** these ops act on the caller's own pools/memberships — no service role needed; the JWT carries `auth.uid()` into the RPC. Fewer deploy units than one Edge Function per op.
- **Consequence:** V6 calls `supabase.rpc(...)`; only `db push` needed to activate (no `functions deploy`).

## Migration `20260701150000_pool_depth.sql`
- `alter table pools add column archived_at timestamptz`.
- `"InviteStatus"` enum + **`pool_directed_invites`** (pool, inviter, invitee_user_id?/invitee_email?, status, created/responded) + partial-unique(pool, invitee_user_id) where PENDING + RLS **select** (inviter/invitee/owner); writes only via fns (no insert/update policy → direct writes denied).
- **`fn_search_nicknames(prefix,limit)`** — ≥2 chars, `nickname_base ilike prefix||'%'`, onboarded, not deleted, not self; limit ≤20.
- **`fn_create_directed_invite(pool, invitee_user_id, invitee_email)`** — permission (owner OR member+members_can_invite), not archived, capacity, not-already-member / not-already-PENDING → insert PENDING. Codes: NOT_ALLOWED/NOT_FOUND/FULL/ALREADY_MEMBER/ALREADY_INVITED.
- **`fn_respond_invite(invite, accept)`** — invitee + PENDING only; accept → capacity re-check + membership insert + ACCEPTED; else DECLINED.
- **`fn_rename_pool(pool,name)`** / **`fn_set_pool_visibility(pool,type)`** — owner; public-name uniqueness guard (NAME_TAKEN).
- **`fn_set_members_can_invite(pool,bool)`** / **`fn_archive_pool(pool,bool)`** — owner.
- **`fn_pool_predictions(pool)`** — member-only; `mem × matches`, effective pred = pool override (`pool_id=pool`) else global (`pool_id null`); **mask**: `revealed = (member=auth.uid()) OR kickoff_at<=now()`; `pre_join = kickoff_at < joined_at`. Non-revealed / pre-join → null pick+score.
- **rework `fn_pool_leaderboard(pool)`** — member-only; per member Σ over matches with `kickoff_at >= joined_at` of `coalesce(pool_override_score, global_score, 0)`; rank; include 0-point members.
- **rework `fn_discover_pools`** — add `and archived_at is null`.
- grants to `authenticated`.

## Effective-prediction rule (single source, used by grid + leaderboard)
`coalesce(pool_pred, global_pred)` where `pool_pred.pool_id = pool`, `global_pred.pool_id is null`, both `(user_id,match_id)`-matched; score via `prediction_scores.prediction_id`.

## Test (ephemeral PG17)
- invites: create (permission/capacity/dup), respond accept→member, decline; search-nicknames prefix.
- owner controls: rename/visibility NAME_TAKEN guard; members_can_invite gate; archive → excluded from discover.
- **masking**: other member's future pick hidden (null) but own visible; past-kickoff pick revealed; pre-join match null.
- **scoped leaderboard**: member who joined after a match doesn't get its points; pool override beats global.
