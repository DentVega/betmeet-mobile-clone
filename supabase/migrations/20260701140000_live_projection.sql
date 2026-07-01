-- Bolt V4 — single-source scoring (fn_points) + live leaderboard projection RPC (ADR-019).

-- composite result of scoring one prediction against one match
do $$ begin
  create type public.score_result as (
    matched_case    "ScoreMatchedCase",
    base_points     integer,
    penalty_applied boolean,
    penalty_points  integer,
    total_points    integer
  );
exception when duplicate_object then null; end $$;

-- The verbatim scoring rule, as a scalar function reused by the trigger + projection.
create or replace function public.fn_points(
  p_ph integer, p_pa integer, p_pw uuid,
  m_h integer, m_a integer, m_ht uuid, m_at uuid, m_win uuid,
  is_ko boolean
) returns public.score_result
language plpgsql immutable as $$
declare
  r public.score_result;
  res integer; hg integer; ag integer;
  pred_side text; win_side text;
begin
  if p_ph = m_h and p_pa = m_a then
    r.matched_case := 'EXACT'; r.base_points := 5;
  else
    res := case when sign(p_ph - p_pa) = sign(m_h - m_a) then 2 else 0 end;
    hg  := case when p_ph = m_h then 1 else 0 end;
    ag  := case when p_pa = m_a then 1 else 0 end;
    r.base_points := res + hg + ag;
    r.matched_case := case when res > 0 then 'RESULT'
                           when (hg + ag) > 0 then 'PARTIAL'
                           else 'MISS' end;
  end if;

  pred_side := case when p_pw = m_ht then 'home' when p_pw = m_at then 'away' else null end;
  win_side  := case when m_win = m_ht then 'home' when m_win = m_at then 'away' else null end;
  r.penalty_applied := coalesce(is_ko, false) and m_h = m_a
                       and pred_side is not null and pred_side = win_side;
  r.penalty_points := case when r.penalty_applied then 1 else 0 end;
  r.total_points := r.base_points + r.penalty_points;
  return r;
end;
$$;

-- Refactor the V3 sweeper to use fn_points (single source of truth).
create or replace function public.fn_score_match(p_match_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  m record; is_knockout boolean; n integer := 0; p record; v public.score_result;
begin
  select id, status, home_score, away_score, home_team_id, away_team_id, winner_team_id, phase_id
    into m from public.matches where id = p_match_id;
  if not found then return 0; end if;

  if m.status <> 'FINISHED' or m.home_score is null or m.away_score is null then
    delete from public.prediction_scores where match_id = p_match_id;
    return 0;
  end if;

  select (type = 'KNOCKOUT') into is_knockout from public.competition_phases where id = m.phase_id;

  for p in
    select id, user_id, home_score, away_score, penalty_winner_team_id
    from public.predictions where match_id = p_match_id
  loop
    v := public.fn_points(p.home_score, p.away_score, p.penalty_winner_team_id,
                          m.home_score, m.away_score, m.home_team_id, m.away_team_id, m.winner_team_id,
                          is_knockout);
    insert into public.prediction_scores
      (prediction_id, match_id, user_id, matched_case, base_points, penalty_applied, penalty_points, total_points, scored_at)
    values
      (p.id, p_match_id, p.user_id, v.matched_case, v.base_points, v.penalty_applied, v.penalty_points, v.total_points, now())
    on conflict (prediction_id) do update set
      matched_case = excluded.matched_case, base_points = excluded.base_points,
      penalty_applied = excluded.penalty_applied, penalty_points = excluded.penalty_points,
      total_points = excluded.total_points, scored_at = excluded.scored_at;
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- Live global ranking: confirmed (from prediction_scores) + projected (LIVE matches).
create or replace function public.fn_global_ranking_live(p_limit integer)
returns table (
  user_id uuid, nickname text, avatar_url text,
  confirmed_points bigint, projected_points bigint,
  confirmed_rank bigint, projected_rank bigint
)
language sql security definer set search_path = public stable as $$
  with confirmed as (
    select ps.user_id, sum(ps.total_points)::bigint as pts
    from public.prediction_scores ps
    join public.predictions p on p.id = ps.prediction_id and p.pool_id is null
    group by ps.user_id
  ),
  live as (
    select pr.user_id,
           sum((public.fn_points(pr.home_score, pr.away_score, pr.penalty_winner_team_id,
                                 m.home_score, m.away_score, m.home_team_id, m.away_team_id, m.winner_team_id,
                                 ph.type = 'KNOCKOUT')).total_points)::bigint as pts
    from public.predictions pr
    join public.matches m on m.id = pr.match_id
      and m.status = 'LIVE' and m.home_score is not null and m.away_score is not null
    join public.competition_phases ph on ph.id = m.phase_id
    where pr.pool_id is null
    group by pr.user_id
  ),
  base as (
    select prof.id as uid,
           (prof.nickname_base || '#' || prof.nickname_discriminator) as nick,
           prof.avatar_url as av,
           coalesce(c.pts, 0) as conf,
           coalesce(c.pts, 0) + coalesce(l.pts, 0) as proj
    from public.profiles prof
    left join confirmed c on c.user_id = prof.id
    left join live l on l.user_id = prof.id
    where prof.deleted_at is null and (c.pts is not null or l.pts is not null)
  )
  select uid, nick, av, conf::bigint, proj::bigint,
         rank() over (order by conf desc) as confirmed_rank,
         rank() over (order by proj desc) as projected_rank
  from base
  order by proj desc
  limit coalesce(p_limit, 100);
$$;

grant execute on function public.fn_points(integer,integer,uuid,integer,integer,uuid,uuid,uuid,boolean) to authenticated;
grant execute on function public.fn_global_ranking_live(integer) to authenticated;
