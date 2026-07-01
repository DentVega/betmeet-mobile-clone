-- Bolt V3 — auto-scoring (ADR-018). plpgsql scoring + trigger on matches; realtime publication.
-- Scoring rules ported verbatim from _shared/scoring.ts (betmeet-clone).

create or replace function public.fn_score_match(p_match_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  m            record;
  is_knockout  boolean;
  winner_side  text;
  n            integer := 0;
  p            record;
  result_pts   integer;
  home_goal    integer;
  away_goal    integer;
  mcase        "ScoreMatchedCase";
  base_pts     integer;
  pred_side    text;
  pen_applied  boolean;
  pen_pts      integer;
begin
  select id, status, home_score, away_score, home_team_id, away_team_id, winner_team_id, phase_id
    into m
  from public.matches where id = p_match_id;
  if not found then return 0; end if;

  -- not scoreable → clear any existing scores (handles revert / status change)
  if m.status <> 'FINISHED' or m.home_score is null or m.away_score is null then
    delete from public.prediction_scores where match_id = p_match_id;
    return 0;
  end if;

  select (type = 'KNOCKOUT') into is_knockout
    from public.competition_phases where id = m.phase_id;

  winner_side := case
    when m.winner_team_id is null then null
    when m.winner_team_id = m.home_team_id then 'home'
    when m.winner_team_id = m.away_team_id then 'away'
    else null end;

  for p in
    select id, user_id, home_score, away_score, penalty_winner_team_id
    from public.predictions where match_id = p_match_id
  loop
    if p.home_score = m.home_score and p.away_score = m.away_score then
      mcase := 'EXACT'; base_pts := 5;
    else
      result_pts := case when sign(p.home_score - p.away_score) = sign(m.home_score - m.away_score) then 2 else 0 end;
      home_goal  := case when p.home_score = m.home_score then 1 else 0 end;
      away_goal  := case when p.away_score = m.away_score then 1 else 0 end;
      base_pts   := result_pts + home_goal + away_goal;
      mcase := case when result_pts > 0 then 'RESULT'
                    when (home_goal + away_goal) > 0 then 'PARTIAL'
                    else 'MISS' end;
    end if;

    pred_side := case
      when p.penalty_winner_team_id is null then null
      when p.penalty_winner_team_id = m.home_team_id then 'home'
      when p.penalty_winner_team_id = m.away_team_id then 'away'
      else null end;
    pen_applied := coalesce(is_knockout, false)
                   and m.home_score = m.away_score
                   and pred_side is not null
                   and pred_side = winner_side;
    pen_pts := case when pen_applied then 1 else 0 end;

    insert into public.prediction_scores
      (prediction_id, match_id, user_id, matched_case, base_points, penalty_applied, penalty_points, total_points, scored_at)
    values
      (p.id, p_match_id, p.user_id, mcase, base_pts, pen_applied, pen_pts, base_pts + pen_pts, now())
    on conflict (prediction_id) do update set
      matched_case    = excluded.matched_case,
      base_points     = excluded.base_points,
      penalty_applied = excluded.penalty_applied,
      penalty_points  = excluded.penalty_points,
      total_points    = excluded.total_points,
      scored_at       = excluded.scored_at;
    n := n + 1;
  end loop;

  return n;
end;
$$;

-- trigger: (re)score a match whenever its result-bearing columns change.
create or replace function public.trg_score_match()
returns trigger language plpgsql as $$
begin
  perform public.fn_score_match(NEW.id);
  return NEW;
end;
$$;

drop trigger if exists score_match on public.matches;
create trigger score_match
  after insert or update of status, home_score, away_score, winner_team_id
  on public.matches
  for each row execute function public.trg_score_match();

-- realtime: expose result-bearing tables so the mobile client can subscribe (V4).
-- no-op on ephemeral PG (no supabase_realtime publication) or when already present.
do $$ begin
  alter publication supabase_realtime add table public.matches;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.prediction_scores;
exception when duplicate_object then null; when undefined_object then null; end $$;
