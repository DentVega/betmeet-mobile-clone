-- Bolt 4 — atomic write functions (plpgsql, SECURITY DEFINER). Called by the
-- Edge Functions with the caller's JWT, so auth.uid() resolves; DEFINER lets
-- them write tables that have no client RLS write policy (ADR-010).
-- Errors are raised with the message set to a stable CODE for the Edge layer.

-- ── fn_create_pool ─────────────────────────────────────────────────────────
create or replace function public.fn_create_pool(
  p_name text,
  p_type "PoolType",
  p_capacity integer,
  p_members_can_invite boolean,
  p_token text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if not exists (select 1 from public.profiles where id = v_uid and onboarding_completed) then
    raise exception 'NOT_ONBOARDED';
  end if;
  if char_length(btrim(p_name)) < 3 or char_length(btrim(p_name)) > 60 then raise exception 'INVALID'; end if;
  if p_capacity < 2 or p_capacity > 100 then raise exception 'INVALID'; end if;
  if p_type = 'PUBLIC' and exists (
    select 1 from public.pools where type = 'PUBLIC' and lower(name) = lower(btrim(p_name))
  ) then
    raise exception 'NAME_TAKEN';
  end if;

  insert into public.pools (name, type, capacity, invite_token, owner_id, members_can_invite)
  values (btrim(p_name), p_type, p_capacity, p_token, v_uid, coalesce(p_members_can_invite, true))
  returning id into v_id;

  insert into public.pool_memberships (pool_id, user_id) values (v_id, v_uid);
  return v_id;
end;
$$;

-- ── fn_join_pool (public, by id) ───────────────────────────────────────────
create or replace function public.fn_join_pool(p_pool uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_type "PoolType";
  v_cap integer;
  v_count integer;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select type, capacity into v_type, v_cap from public.pools where id = p_pool;
  if not found or v_type <> 'PUBLIC' then raise exception 'NOT_FOUND'; end if;

  if exists (select 1 from public.pool_memberships where pool_id = p_pool and user_id = v_uid) then
    return jsonb_build_object('ok', true, 'poolId', p_pool, 'alreadyMember', true);
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_pool::text, 0));
  select count(*) into v_count from public.pool_memberships where pool_id = p_pool and archived_at is null;
  if v_count >= v_cap then raise exception 'FULL'; end if;

  insert into public.pool_memberships (pool_id, user_id) values (p_pool, v_uid);
  return jsonb_build_object('ok', true, 'poolId', p_pool, 'alreadyMember', false);
end;
$$;

-- ── fn_join_pool_by_token (public or private, by invite token) ─────────────
create or replace function public.fn_join_pool_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pool uuid;
  v_cap integer;
  v_count integer;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select id, capacity into v_pool, v_cap from public.pools where invite_token = upper(btrim(p_token));
  if not found then raise exception 'NOT_FOUND'; end if;

  if exists (select 1 from public.pool_memberships where pool_id = v_pool and user_id = v_uid) then
    return jsonb_build_object('ok', true, 'poolId', v_pool, 'alreadyMember', true);
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_pool::text, 0));
  select count(*) into v_count from public.pool_memberships where pool_id = v_pool and archived_at is null;
  if v_count >= v_cap then raise exception 'FULL'; end if;

  insert into public.pool_memberships (pool_id, user_id) values (v_pool, v_uid);
  return jsonb_build_object('ok', true, 'poolId', v_pool, 'alreadyMember', false);
end;
$$;

-- ── fn_save_prediction ─────────────────────────────────────────────────────
create or replace function public.fn_save_prediction(
  p_match uuid,
  p_home integer,
  p_away integer,
  p_pen uuid,
  p_pool uuid,
  p_also_global boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_status "MatchStatus";
  v_kick timestamptz;
  v_home_team uuid;
  v_away_team uuid;
  v_phase "CompetitionPhaseType";
  v_editable boolean;
  v_reason "PredictionLockReason";
  v_is_knockout boolean;
  v_is_draw boolean;
  v_pen uuid := p_pen;
  v_scopes uuid[];
  v_scope uuid;
  v_id uuid;
  v_locked timestamptz;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if not exists (select 1 from public.profiles where id = v_uid and onboarding_completed) then
    raise exception 'NOT_ONBOARDED';
  end if;
  if p_pool is not null and not exists (
    select 1 from public.pool_memberships where pool_id = p_pool and user_id = v_uid and archived_at is null
  ) then
    raise exception 'NOT_MEMBER';
  end if;
  if p_home < 0 or p_home > 20 or p_away < 0 or p_away > 20 then raise exception 'INVALID'; end if;

  select m.status, m.kickoff_at, m.home_team_id, m.away_team_id, ph.type
    into v_status, v_kick, v_home_team, v_away_team, v_phase
  from public.matches m
  join public.competition_phases ph on ph.id = m.phase_id
  where m.id = p_match;
  if not found then raise exception 'NOT_FOUND'; end if;

  v_editable := (v_status = 'SCHEDULED' and v_kick is not null and v_kick > now()
                 and v_home_team is not null and v_away_team is not null);

  if not v_editable then
    v_reason := case
      when v_status = 'CANCELLED' then 'CANCELLED'::"PredictionLockReason"
      when v_status = 'POSTPONED' then 'POSTPONED'::"PredictionLockReason"
      when v_home_team is null or v_away_team is null or v_kick is null then 'MATCH_NOT_EDITABLE'::"PredictionLockReason"
      when v_kick <= now() then 'KICKOFF_REACHED'::"PredictionLockReason"
      else 'MATCH_STATUS_LOCKED'::"PredictionLockReason"
    end;
    update public.predictions
      set locked_at = now(), lock_reason = v_reason
      where user_id = v_uid and match_id = p_match and locked_at is null;
    -- Return (not raise): raising would roll back the lock we just stamped.
    return jsonb_build_object('ok', false, 'code', 'LOCKED', 'reason', v_reason);
  end if;

  v_is_knockout := (v_phase = 'KNOCKOUT');
  v_is_draw := (p_home = p_away);
  if v_is_knockout and v_is_draw then
    if v_pen is null or (v_pen <> v_home_team and v_pen <> v_away_team) then raise exception 'INVALID'; end if;
  else
    v_pen := null;  -- penalty winner only for a knockout draw
  end if;

  if p_pool is null then
    v_scopes := array[null::uuid];
  elsif coalesce(p_also_global, false) then
    v_scopes := array[null::uuid, p_pool];
  else
    v_scopes := array[p_pool];
  end if;

  foreach v_scope in array v_scopes loop
    select id, locked_at into v_id, v_locked
    from public.predictions
    where user_id = v_uid and match_id = p_match and pool_id is not distinct from v_scope;

    if v_id is null then
      insert into public.predictions (user_id, match_id, pool_id, home_score, away_score, penalty_winner_team_id)
      values (v_uid, p_match, v_scope, p_home, p_away, v_pen);
    else
      if v_locked is not null then
        -- clear the lock first (no score change) so the lock-guard trigger allows the next update
        update public.predictions set locked_at = null, lock_reason = null where id = v_id;
      end if;
      update public.predictions
        set home_score = p_home, away_score = p_away, penalty_winner_team_id = v_pen
        where id = v_id;
    end if;
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;

-- Allow authenticated callers (via the Edge Functions' JWT) to execute these.
grant execute on function public.fn_create_pool(text, "PoolType", integer, boolean, text) to authenticated;
grant execute on function public.fn_join_pool(uuid) to authenticated;
grant execute on function public.fn_join_pool_by_token(text) to authenticated;
grant execute on function public.fn_save_prediction(uuid, integer, integer, uuid, uuid, boolean) to authenticated;
