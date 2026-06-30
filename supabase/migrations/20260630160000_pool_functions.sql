-- Bolt 8 — pool membership functions + discover read RPC (ADR-014).
-- plpgsql SECURITY DEFINER + auth.uid(); execute granted to authenticated.

create or replace function public.fn_leave_pool(p_pool uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select owner_id into v_owner from public.pools where id = p_pool;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_owner = v_uid then raise exception 'OWNER_CANNOT_LEAVE'; end if;
  delete from public.pool_memberships where pool_id = p_pool and user_id = v_uid;
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.fn_kick_member(p_pool uuid, p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select owner_id into v_owner from public.pools where id = p_pool;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_owner <> v_uid then raise exception 'NOT_OWNER'; end if;
  if p_user = v_owner then raise exception 'INVALID'; end if; -- can't kick the owner
  delete from public.pool_memberships where pool_id = p_pool and user_id = p_user;
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.fn_delete_pool(p_pool uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select owner_id into v_owner from public.pools where id = p_pool;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_owner <> v_uid then raise exception 'NOT_OWNER'; end if;
  delete from public.pools where id = p_pool; -- FK cascade clears memberships + pool predictions
  return jsonb_build_object('ok', true);
end; $$;

-- Discover public pools with aggregate counts, without exposing member rows.
create or replace function public.fn_discover_pools(
  p_query text, p_only_open boolean, p_limit integer, p_offset integer
)
returns table (
  id uuid, name text, type text, capacity integer, member_count bigint, is_member boolean
)
language sql security definer set search_path = public stable as $$
  select
    p.id,
    p.name::text,
    p.type::text,
    p.capacity,
    (select count(*) from public.pool_memberships m where m.pool_id = p.id and m.archived_at is null) as member_count,
    exists (select 1 from public.pool_memberships me where me.pool_id = p.id and me.user_id = auth.uid()) as is_member
  from public.pools p
  where p.type = 'PUBLIC'
    and (p_query is null or p_query = '' or p.name ilike '%' || p_query || '%')
    and (
      not coalesce(p_only_open, false)
      or (select count(*) from public.pool_memberships m where m.pool_id = p.id and m.archived_at is null) < p.capacity
    )
  order by p.name
  limit coalesce(p_limit, 20) offset coalesce(p_offset, 0);
$$;

grant execute on function public.fn_leave_pool(uuid) to authenticated;
grant execute on function public.fn_kick_member(uuid, uuid) to authenticated;
grant execute on function public.fn_delete_pool(uuid) to authenticated;
grant execute on function public.fn_discover_pools(text, boolean, integer, integer) to authenticated;
