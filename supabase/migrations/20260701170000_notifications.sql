-- Bolt V10 — notifications schema: subscriptions, preferences, outbox + deliveries.
-- Emission via non-invasive triggers (does not touch the V3 scoring / V5 invite fns).

do $$ begin
  create type "NotificationType" as enum ('match_start', 'match_end', 'pool_invite', 'rank_up', 'goal');
exception when duplicate_object then null; end $$;

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  token        text not null unique,
  platform     text not null default 'android',
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

create table if not exists public.notification_preferences (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  match_start boolean not null default true,
  match_end   boolean not null default true,
  pool_invite boolean not null default true,
  rank_up     boolean not null default true,
  goal        boolean not null default true
);

create table if not exists public.notification_events (
  id            uuid primary key default gen_random_uuid(),
  type          "NotificationType" not null,
  payload       jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  dispatched_at timestamptz
);
create index if not exists notification_events_undispatched_idx
  on public.notification_events (created_at) where dispatched_at is null;

create table if not exists public.notification_deliveries (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.notification_events(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  status          text not null default 'sent',
  created_at      timestamptz not null default now()
);

-- RLS: own-row for subscriptions + preferences; events/deliveries are service-role only.
alter table public.push_subscriptions enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_events enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists push_subs_own on public.push_subscriptions;
create policy push_subs_own on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notif_prefs_own on public.notification_preferences;
create policy notif_prefs_own on public.notification_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- default preferences on profile creation
create or replace function public.trg_default_notif_prefs()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_preferences (user_id) values (NEW.id)
  on conflict (user_id) do nothing;
  return NEW;
end; $$;
drop trigger if exists default_notif_prefs on public.profiles;
create trigger default_notif_prefs after insert on public.profiles
  for each row execute function public.trg_default_notif_prefs();

-- emit match_end when a match finishes (non-invasive; separate from the scoring trigger)
create or replace function public.trg_emit_match_end()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.status = 'FINISHED' and (OLD.status is distinct from 'FINISHED') then
    insert into public.notification_events (type, payload)
    values ('match_end', jsonb_build_object(
      'matchId', NEW.id, 'homeScore', NEW.home_score, 'awayScore', NEW.away_score,
      'link', 'betmeet://match/' || NEW.id));
  end if;
  return NEW;
end; $$;
drop trigger if exists emit_match_end on public.matches;
create trigger emit_match_end after update of status on public.matches
  for each row execute function public.trg_emit_match_end();

-- emit pool_invite when a directed invite is created
create or replace function public.trg_emit_pool_invite()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.invitee_user_id is not null then
    insert into public.notification_events (type, payload)
    values ('pool_invite', jsonb_build_object(
      'poolId', NEW.pool_id, 'inviteeUserId', NEW.invitee_user_id, 'inviterId', NEW.inviter_id,
      'link', 'betmeet://pool/' || NEW.pool_id));
  end if;
  return NEW;
end; $$;
drop trigger if exists emit_pool_invite on public.pool_directed_invites;
create trigger emit_pool_invite after insert on public.pool_directed_invites
  for each row execute function public.trg_emit_pool_invite();

-- backfill preferences for existing users
insert into public.notification_preferences (user_id)
  select id from public.profiles where deleted_at is null
  on conflict (user_id) do nothing;
