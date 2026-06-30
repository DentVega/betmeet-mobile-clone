-- Bolt 9 — ranking read RPCs (ADR-015). SECURITY DEFINER: aggregate across users
-- without exposing individual prediction_scores rows (RLS-safe).

-- Global ranking: total of each user's global-scope (pool_id null) prediction scores.
create or replace function public.fn_global_ranking(p_limit integer)
returns table (
  user_id uuid, nickname text, avatar_url text, total_points bigint, rank bigint
)
language sql security definer set search_path = public stable as $$
  with totals as (
    select ps.user_id, sum(ps.total_points)::bigint as pts
    from public.prediction_scores ps
    join public.predictions p on p.id = ps.prediction_id and p.pool_id is null
    group by ps.user_id
  )
  select
    t.user_id,
    (pr.nickname_base || '#' || pr.nickname_discriminator) as nickname,
    pr.avatar_url,
    t.pts as total_points,
    rank() over (order by t.pts desc) as rank
  from totals t
  join public.profiles pr on pr.id = t.user_id
  where pr.deleted_at is null
  order by t.pts desc
  limit coalesce(p_limit, 100);
$$;

-- Pool leaderboard: the pool's active members ranked by their GLOBAL points
-- (v1 has global-only predictions). Members with 0 included. Membership required.
create or replace function public.fn_pool_leaderboard(p_pool uuid)
returns table (
  user_id uuid, nickname text, avatar_url text, total_points bigint, rank bigint
)
language plpgsql security definer set search_path = public stable as $$
begin
  if not public.is_pool_member(p_pool, auth.uid()) then
    raise exception 'NOT_MEMBER';
  end if;
  return query
    select
      pm.user_id,
      (pr.nickname_base || '#' || pr.nickname_discriminator) as nickname,
      pr.avatar_url,
      coalesce(sum(ps.total_points), 0)::bigint as total_points,
      rank() over (order by coalesce(sum(ps.total_points), 0) desc) as rank
    from public.pool_memberships pm
    join public.profiles pr on pr.id = pm.user_id
    left join public.predictions p on p.user_id = pm.user_id and p.pool_id is null
    left join public.prediction_scores ps on ps.prediction_id = p.id
    where pm.pool_id = p_pool and pm.archived_at is null
    group by pm.user_id, pr.nickname_base, pr.nickname_discriminator, pr.avatar_url
    order by total_points desc;
end;
$$;

grant execute on function public.fn_global_ranking(integer) to authenticated;
grant execute on function public.fn_pool_leaderboard(uuid) to authenticated;
