-- Bolt 3 — triggers (ported from the blueprint).

-- Generic updated_at maintenance.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated     before update on public.profiles     for each row execute function public.set_updated_at();
create trigger trg_teams_updated        before update on public.teams        for each row execute function public.set_updated_at();
create trigger trg_competitions_updated before update on public.competitions for each row execute function public.set_updated_at();
create trigger trg_matches_updated      before update on public.matches      for each row execute function public.set_updated_at();
create trigger trg_predictions_updated  before update on public.predictions  for each row execute function public.set_updated_at();

-- Auto-create a profiles row when an auth user is created (closes the Bolt 1
-- profile-gate gap). Picks a random default avatar if any exist.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avatar text;
begin
  select url into v_avatar from public.avatar_assets order by random() limit 1;
  insert into public.profiles (id, avatar_url, avatar_source, verification_status, created_at, updated_at)
  values (new.id, coalesce(v_avatar, ''), 'DEFAULT_SET', 'UNVERIFIED', now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A locked prediction is immutable (tamper-proof even against direct writes).
create or replace function public.prediction_lock_guard()
returns trigger language plpgsql as $$
begin
  if old.locked_at is not null and (
    new.home_score is distinct from old.home_score or
    new.away_score is distinct from old.away_score or
    new.penalty_winner_team_id is distinct from old.penalty_winner_team_id
  ) then
    raise exception 'Cannot modify a locked prediction (match_id=%, user_id=%)', old.match_id, old.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prediction_lock_guard on public.predictions;
create trigger trg_prediction_lock_guard
  before update on public.predictions
  for each row execute function public.prediction_lock_guard();
