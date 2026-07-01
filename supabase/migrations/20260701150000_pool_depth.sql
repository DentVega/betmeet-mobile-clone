-- Bolt V5 — Pool Depth backend (ADR-020). Directed invites, owner controls,
-- masked predictions grid, membership-scoped leaderboard. All SECURITY DEFINER RPCs.

alter table public.pools add column if not exists archived_at timestamptz;

do $$ begin
  create type "InviteStatus" as enum ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');
exception when duplicate_object then null; end $$;

create table if not exists public.pool_directed_invites (
  id              uuid primary key default gen_random_uuid(),
  pool_id         uuid not null references public.pools(id) on delete cascade,
  inviter_id      uuid not null references public.profiles(id) on delete cascade,
  invitee_user_id uuid references public.profiles(id) on delete cascade,
  invitee_email   text,
  status          "InviteStatus" not null default 'PENDING',
  created_at      timestamptz not null default now(),
  responded_at    timestamptz,
  constraint pool_directed_invites_target check (invitee_user_id is not null or invitee_email is not null)
);
create index if not exists pool_directed_invites_pool_idx on public.pool_directed_invites (pool_id);
create index if not exists pool_directed_invites_invitee_idx on public.pool_directed_invites (invitee_user_id);
create unique index if not exists pool_directed_invites_pending_unique
  on public.pool_directed_invites (pool_id, invitee_user_id)
  where status = 'PENDING' and invitee_user_id is not null;

alter table public.pool_directed_invites enable row level security;
-- reads: inviter, invitee, or the pool owner. writes only via SECURITY DEFINER fns.
drop policy if exists pool_invites_select on public.pool_directed_invites;
create policy pool_invites_select on public.pool_directed_invites for select to authenticated
  using (
    inviter_id = auth.uid()
    or invitee_user_id = auth.uid()
    or exists (select 1 from public.pools p where p.id = pool_id and p.owner_id = auth.uid())
  );

-- ── nickname typeahead ────────────────────────────────────────────────────────
create or replace function public.fn_search_nicknames(p_prefix text, p_limit integer)
returns table (user_id uuid, nickname text, avatar_url text)
language sql security definer set search_path = public stable as $$
  select pr.id,
         (pr.nickname_base || '#' || pr.nickname_discriminator),
         pr.avatar_url
  from public.profiles pr
  where pr.deleted_at is null
    and pr.onboarding_completed
    and pr.id <> auth.uid()
    and length(coalesce(p_prefix, '')) >= 2
    and pr.nickname_base ilike p_prefix || '%'
  order by pr.nickname_base
  limit least(coalesce(p_limit, 10), 20);
$$;

-- ── directed invites ──────────────────────────────────────────────────────────
create or replace function public.fn_create_directed_invite(
  p_pool uuid, p_invitee_user_id uuid, p_invitee_email text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid; v_cap integer; v_mci boolean; v_arch timestamptz; v_count integer;
  v_id uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select owner_id, capacity, members_can_invite, archived_at
    into v_owner, v_cap, v_mci, v_arch
  from public.pools where id = p_pool;
  if not found or v_arch is not null then raise exception 'NOT_FOUND'; end if;

  if v_owner <> v_uid and not (public.is_pool_member(p_pool, v_uid) and v_mci) then
    raise exception 'NOT_ALLOWED';
  end if;
  if p_invitee_user_id is null and p_invitee_email is null then raise exception 'INVALID'; end if;

  if p_invitee_user_id is not null then
    if public.is_pool_member(p_pool, p_invitee_user_id) then raise exception 'ALREADY_MEMBER'; end if;
    if exists (select 1 from public.pool_directed_invites
               where pool_id = p_pool and invitee_user_id = p_invitee_user_id and status = 'PENDING') then
      raise exception 'ALREADY_INVITED';
    end if;
  end if;

  select count(*) into v_count from public.pool_memberships where pool_id = p_pool and archived_at is null;
  if v_count >= v_cap then raise exception 'FULL'; end if;

  insert into public.pool_directed_invites (pool_id, inviter_id, invitee_user_id, invitee_email)
  values (p_pool, v_uid, p_invitee_user_id, p_invitee_email)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'invite_id', v_id);
end; $$;

create or replace function public.fn_respond_invite(p_invite uuid, p_accept boolean)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_pool uuid; v_cap integer; v_count integer;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select pool_id into v_pool from public.pool_directed_invites
    where id = p_invite and invitee_user_id = v_uid and status = 'PENDING';
  if not found then raise exception 'NOT_FOUND'; end if;

  if p_accept then
    select capacity into v_cap from public.pools where id = v_pool;
    select count(*) into v_count from public.pool_memberships where pool_id = v_pool and archived_at is null;
    if v_count >= v_cap then raise exception 'FULL'; end if;
    insert into public.pool_memberships (pool_id, user_id)
      values (v_pool, v_uid)
      on conflict (pool_id, user_id) do update set archived_at = null;
    update public.pool_directed_invites set status = 'ACCEPTED', responded_at = now() where id = p_invite;
  else
    update public.pool_directed_invites set status = 'DECLINED', responded_at = now() where id = p_invite;
  end if;
  return jsonb_build_object('ok', true, 'pool_id', v_pool);
end; $$;

-- ── owner controls ────────────────────────────────────────────────────────────
create or replace function public.fn_rename_pool(p_pool uuid, p_name text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid; v_type "PoolType";
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_name is null or length(btrim(p_name)) < 3 or length(p_name) > 60 then raise exception 'INVALID'; end if;
  select owner_id, type into v_owner, v_type from public.pools where id = p_pool;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_owner <> v_uid then raise exception 'NOT_OWNER'; end if;
  if v_type = 'PUBLIC' and exists (
     select 1 from public.pools where lower(name) = lower(btrim(p_name)) and type = 'PUBLIC' and id <> p_pool
  ) then raise exception 'NAME_TAKEN'; end if;
  update public.pools set name = btrim(p_name) where id = p_pool;
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.fn_set_pool_visibility(p_pool uuid, p_type text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid; v_name text;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_type not in ('PUBLIC', 'PRIVATE') then raise exception 'INVALID'; end if;
  select owner_id, name into v_owner, v_name from public.pools where id = p_pool;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_owner <> v_uid then raise exception 'NOT_OWNER'; end if;
  if p_type = 'PUBLIC' and exists (
     select 1 from public.pools where lower(name) = lower(v_name) and type = 'PUBLIC' and id <> p_pool
  ) then raise exception 'NAME_TAKEN'; end if;
  update public.pools set type = p_type::"PoolType" where id = p_pool;
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.fn_set_members_can_invite(p_pool uuid, p_value boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select owner_id into v_owner from public.pools where id = p_pool;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_owner <> v_uid then raise exception 'NOT_OWNER'; end if;
  update public.pools set members_can_invite = coalesce(p_value, true) where id = p_pool;
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.fn_archive_pool(p_pool uuid, p_archived boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select owner_id into v_owner from public.pools where id = p_pool;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_owner <> v_uid then raise exception 'NOT_OWNER'; end if;
  update public.pools set archived_at = case when p_archived then now() else null end where id = p_pool;
  return jsonb_build_object('ok', true);
end; $$;

-- ── masked predictions grid ───────────────────────────────────────────────────
create or replace function public.fn_pool_predictions(p_pool uuid)
returns table (
  match_id uuid, kickoff_at timestamptz, status text,
  member_id uuid, nickname text, avatar_url text,
  home_score integer, away_score integer, penalty_winner_team_id uuid,
  total_points integer, revealed boolean, pre_join boolean
)
language sql security definer set search_path = public stable as $$
  with mem as (
    select pm.user_id, pm.joined_at,
           (pr.nickname_base || '#' || pr.nickname_discriminator) as nick, pr.avatar_url as av
    from public.pool_memberships pm
    join public.profiles pr on pr.id = pm.user_id
    where pm.pool_id = p_pool and pm.archived_at is null
  ),
  mts as (
    select m.id, m.kickoff_at, m.status::text as status
    from public.matches m
    join public.competitions c on c.id = m.competition_id and c.is_active
  ),
  eff as (
    select mem.user_id, mem.joined_at, mem.nick, mem.av,
           mts.id as match_id, mts.kickoff_at, mts.status,
           coalesce(po.id, pg.id) as pred_id,
           coalesce(po.home_score, pg.home_score) as hs,
           coalesce(po.away_score, pg.away_score) as as_,
           coalesce(po.penalty_winner_team_id, pg.penalty_winner_team_id) as pw
    from mem
    cross join mts
    left join public.predictions po on po.user_id = mem.user_id and po.match_id = mts.id and po.pool_id = p_pool
    left join public.predictions pg on pg.user_id = mem.user_id and pg.match_id = mts.id and pg.pool_id is null
  )
  select
    eff.match_id, eff.kickoff_at, eff.status,
    eff.user_id as member_id, eff.nick, eff.av,
    case when pre.pre_join or not pre.revealed then null else eff.hs end,
    case when pre.pre_join or not pre.revealed then null else eff.as_ end,
    case when pre.pre_join or not pre.revealed then null else eff.pw end,
    case when pre.pre_join or not pre.revealed then null else ps.total_points end,
    pre.revealed, pre.pre_join
  from eff
  cross join lateral (
    select
      (eff.kickoff_at < eff.joined_at) as pre_join,
      (eff.user_id = auth.uid() or eff.kickoff_at <= now()) as revealed
  ) pre
  left join public.prediction_scores ps on ps.prediction_id = eff.pred_id
  where public.is_pool_member(p_pool, auth.uid());
$$;

-- ── membership-scoped pool leaderboard (rework, FR-PD7) ───────────────────────
create or replace function public.fn_pool_leaderboard(p_pool uuid)
returns table (
  user_id uuid, nickname text, avatar_url text, total_points bigint, rank bigint
)
language plpgsql security definer set search_path = public stable as $$
begin
  if not public.is_pool_member(p_pool, auth.uid()) then raise exception 'NOT_MEMBER'; end if;
  return query
  with mem as (
    select pm.user_id, pm.joined_at,
           (pr.nickname_base || '#' || pr.nickname_discriminator) as nick, pr.avatar_url as av
    from public.pool_memberships pm
    join public.profiles pr on pr.id = pm.user_id
    where pm.pool_id = p_pool and pm.archived_at is null
  ),
  per as (
    select mem.user_id,
           coalesce(pso.total_points, psg.total_points, 0) as pts
    from mem
    join public.matches m on m.kickoff_at >= mem.joined_at
    left join public.predictions po on po.user_id = mem.user_id and po.match_id = m.id and po.pool_id = p_pool
    left join public.predictions pg on pg.user_id = mem.user_id and pg.match_id = m.id and pg.pool_id is null
    left join public.prediction_scores pso on pso.prediction_id = po.id
    left join public.prediction_scores psg on psg.prediction_id = pg.id
  ),
  tot as (select per.user_id, sum(per.pts)::bigint as pts from per group by per.user_id)
  select mem.user_id, mem.nick, mem.av,
         coalesce(tot.pts, 0)::bigint,
         rank() over (order by coalesce(tot.pts, 0) desc)
  from mem left join tot on tot.user_id = mem.user_id
  order by coalesce(tot.pts, 0) desc;
end; $$;

-- discover excludes archived pools
create or replace function public.fn_discover_pools(
  p_query text, p_only_open boolean, p_limit integer, p_offset integer
)
returns table (
  id uuid, name text, type text, capacity integer, member_count bigint, is_member boolean
)
language sql security definer set search_path = public stable as $$
  select
    p.id, p.name::text, p.type::text, p.capacity,
    (select count(*) from public.pool_memberships m where m.pool_id = p.id and m.archived_at is null) as member_count,
    exists (select 1 from public.pool_memberships me where me.pool_id = p.id and me.user_id = auth.uid()) as is_member
  from public.pools p
  where p.type = 'PUBLIC' and p.archived_at is null
    and (p_query is null or p_query = '' or p.name ilike '%' || p_query || '%')
    and (
      not coalesce(p_only_open, false)
      or (select count(*) from public.pool_memberships m where m.pool_id = p.id and m.archived_at is null) < p.capacity
    )
  order by p.name
  limit coalesce(p_limit, 20) offset coalesce(p_offset, 0);
$$;

grant execute on function public.fn_search_nicknames(text, integer) to authenticated;
grant execute on function public.fn_create_directed_invite(uuid, uuid, text) to authenticated;
grant execute on function public.fn_respond_invite(uuid, boolean) to authenticated;
grant execute on function public.fn_rename_pool(uuid, text) to authenticated;
grant execute on function public.fn_set_pool_visibility(uuid, text) to authenticated;
grant execute on function public.fn_set_members_can_invite(uuid, boolean) to authenticated;
grant execute on function public.fn_archive_pool(uuid, boolean) to authenticated;
grant execute on function public.fn_pool_predictions(uuid) to authenticated;
