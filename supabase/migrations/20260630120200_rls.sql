-- Bolt 3 — RLS (ADR-009). Reads for role `authenticated`; game-state writes go
-- through Edge Functions (service role, Bolt 4). predictions keep own-unlocked
-- write policies (the lock trigger makes locked rows immutable regardless).

-- SECURITY DEFINER helper to avoid recursive RLS on pool/membership self-joins.
create or replace function public.is_pool_member(p_pool_id uuid, p_user uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.pool_memberships m
    where m.pool_id = p_pool_id
      and m.user_id = p_user
      and m.archived_at is null
  );
$$;

-- profiles
alter table public.profiles enable row level security;
create policy profiles_select_own    on public.profiles for select to authenticated using (auth.uid() = id);
create policy profiles_select_others on public.profiles for select to authenticated using (deleted_at is null);
create policy profiles_update_own    on public.profiles for update to authenticated
  using (auth.uid() = id and deleted_at is null) with check (auth.uid() = id);

-- avatar_assets (public, incl. anon — for the avatar picker)
alter table public.avatar_assets enable row level security;
create policy avatar_assets_select_public on public.avatar_assets for select using (true);

-- reference data: any authenticated user may read
alter table public.teams enable row level security;
create policy teams_select_authenticated on public.teams for select to authenticated using (true);

alter table public.competitions enable row level security;
create policy competitions_select_authenticated on public.competitions for select to authenticated using (true);

alter table public.competition_phases enable row level security;
create policy competition_phases_select_authenticated on public.competition_phases for select to authenticated using (true);

alter table public.matches enable row level security;
create policy matches_select_authenticated on public.matches for select to authenticated using (true);

-- pools: public ones, or ones you belong to
alter table public.pools enable row level security;
create policy pools_select_public on public.pools for select to authenticated using (type = 'PUBLIC');
create policy pools_select_member on public.pools for select to authenticated using (public.is_pool_member(id, auth.uid()));

-- pool_memberships: visible to co-members of the same pool
alter table public.pool_memberships enable row level security;
create policy pool_memberships_select_same_pool on public.pool_memberships for select to authenticated
  using (public.is_pool_member(pool_id, auth.uid()));

-- predictions: own row, insert/update only while unlocked
alter table public.predictions enable row level security;
create policy predictions_select_own on public.predictions for select to authenticated using (auth.uid() = user_id);
create policy predictions_insert_own on public.predictions for insert to authenticated with check (auth.uid() = user_id);
create policy predictions_update_own_unlocked on public.predictions for update to authenticated
  using (auth.uid() = user_id and locked_at is null)
  with check (auth.uid() = user_id and locked_at is null);

-- prediction_scores: own, plus pool peers (no client writes — scoring fn only)
alter table public.prediction_scores enable row level security;
create policy prediction_scores_select_own on public.prediction_scores for select to authenticated
  using (user_id = auth.uid());
create policy prediction_scores_select_pool_peers on public.prediction_scores for select to authenticated
  using (
    exists (
      select 1 from public.predictions p
      where p.id = prediction_scores.prediction_id
        and p.pool_id is not null
        and public.is_pool_member(p.pool_id, auth.uid())
    )
  );
