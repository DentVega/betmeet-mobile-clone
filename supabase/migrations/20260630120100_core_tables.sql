-- Bolt 3 — v1 core tables (snake_case, from the betmeet-clone blueprint, minus
-- deferred provider-sync / notification / admin-override columns). timestamptz
-- throughout so Edge Functions can compare now() vs kickoff_at reliably.

-- Default avatar catalog (seeded in 20260630120400_seed_avatars.sql).
create table public.avatar_assets (
  id          uuid primary key default gen_random_uuid(),
  key         varchar(48) not null unique,
  url         text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Identity: profiles.id IS auth.users.id.
create table public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  nickname_base          varchar(20),
  nickname_discriminator char(4),
  avatar_url             text not null default '',
  avatar_source          "AvatarSource" not null default 'DEFAULT_SET',
  verification_status    "VerificationStatus" not null default 'UNVERIFIED',
  mfa_enabled            boolean not null default false,
  nickname_updated_at    timestamptz,
  nickname_change_count  integer not null default 0,
  onboarding_completed   boolean not null default false,
  locale                 varchar(2) not null default 'es',
  deleted_at             timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint profiles_locale_check check (locale in ('es', 'en')),
  constraint profiles_nickname_unique unique (nickname_base, nickname_discriminator)
);
create index profiles_deleted_at_idx on public.profiles (deleted_at);

create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(120) not null,
  fifa_code   char(3) not null unique,
  iso_alpha2  varchar(12),
  flag_key    varchar(24) not null,
  flag_path   varchar(120) not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.competitions (
  id          uuid primary key default gen_random_uuid(),
  slug        varchar(80) not null unique,
  name        varchar(120) not null,
  season      varchar(20) not null,
  starts_at   timestamptz,
  ends_at     timestamptz,
  timezone    varchar(80) not null default 'UTC',
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index competitions_is_active_idx on public.competitions (is_active);

create table public.competition_phases (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name           varchar(120) not null,
  type           "CompetitionPhaseType" not null,
  group_code     varchar(8),
  display_order  integer not null,
  starts_at      timestamptz,
  ends_at        timestamptz,
  constraint competition_phases_comp_order_unique unique (competition_id, display_order)
);
create index competition_phases_comp_type_idx on public.competition_phases (competition_id, type);

create table public.matches (
  id                 uuid primary key default gen_random_uuid(),
  competition_id     uuid not null references public.competitions(id) on delete cascade,
  phase_id           uuid not null references public.competition_phases(id) on delete cascade,
  match_number       integer,
  kickoff_at         timestamptz,
  status             "MatchStatus" not null default 'SCHEDULED',
  home_team_id       uuid references public.teams(id) on delete set null,
  away_team_id       uuid references public.teams(id) on delete set null,
  home_placeholder   varchar(120),
  away_placeholder   varchar(120),
  home_score         integer,
  away_score         integer,
  home_penalty_score integer,
  away_penalty_score integer,
  winner_team_id     uuid references public.teams(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint matches_scores_non_negative check (
    (home_score is null or home_score >= 0) and
    (away_score is null or away_score >= 0) and
    (home_penalty_score is null or home_penalty_score >= 0) and
    (away_penalty_score is null or away_penalty_score >= 0)
  ),
  constraint matches_comp_number_unique unique (competition_id, match_number)
);
create index matches_competition_id_idx on public.matches (competition_id);
create index matches_phase_id_idx       on public.matches (phase_id);
create index matches_status_idx         on public.matches (status);
create index matches_kickoff_at_idx     on public.matches (kickoff_at);
create index matches_comp_kickoff_idx   on public.matches (competition_id, kickoff_at);
create index matches_comp_status_idx    on public.matches (competition_id, status);

create table public.pools (
  id                 uuid primary key default gen_random_uuid(),
  name               varchar(60) not null,
  type               "PoolType" not null,
  capacity           integer not null,
  invite_token       varchar(12) not null unique,
  owner_id           uuid not null references public.profiles(id) on delete restrict,
  members_can_invite boolean not null default true,
  created_at         timestamptz not null default now(),
  constraint pools_capacity_range check (capacity between 2 and 100)
);
create index pools_owner_id_idx on public.pools (owner_id);
create index pools_type_idx     on public.pools (type);
-- public pool names are unique (case-insensitive); private pools unconstrained.
create unique index pools_public_name_unique on public.pools (lower(name)) where type = 'PUBLIC';

create table public.pool_memberships (
  id          uuid primary key default gen_random_uuid(),
  pool_id     uuid not null references public.pools(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  archived_at timestamptz,
  constraint pool_memberships_pool_user_unique unique (pool_id, user_id)
);
create index pool_memberships_user_id_idx on public.pool_memberships (user_id);

create table public.predictions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  match_id               uuid not null references public.matches(id) on delete cascade,
  pool_id                uuid references public.pools(id) on delete cascade,
  home_score             integer not null,
  away_score             integer not null,
  penalty_winner_team_id uuid references public.teams(id) on delete set null,
  locked_at              timestamptz,
  lock_reason            "PredictionLockReason",
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint predictions_scores_range check (
    home_score between 0 and 20 and away_score between 0 and 20
  )
);
create index predictions_user_id_idx   on public.predictions (user_id);
create index predictions_match_id_idx  on public.predictions (match_id);
create index predictions_locked_at_idx on public.predictions (locked_at);
-- one prediction per user/match in the global scope, and per user/match/pool otherwise.
create unique index predictions_user_match_global_uk on public.predictions (user_id, match_id) where pool_id is null;
create unique index predictions_user_match_pool_uk   on public.predictions (user_id, match_id, pool_id) where pool_id is not null;

create table public.prediction_scores (
  id              uuid primary key default gen_random_uuid(),
  prediction_id   uuid not null unique references public.predictions(id) on delete cascade,
  match_id        uuid not null references public.matches(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  matched_case    "ScoreMatchedCase" not null,
  base_points     integer not null,
  penalty_applied boolean not null default false,
  penalty_points  integer not null default 0,
  total_points    integer not null,
  scored_at       timestamptz not null default now()
);
create index prediction_scores_match_id_idx on public.prediction_scores (match_id);
create index prediction_scores_user_id_idx  on public.prediction_scores (user_id);
