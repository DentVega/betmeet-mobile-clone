-- Fix: "today's France vs Spain match doesn't show in the Matches section."
-- Root cause was pure data — the dev fixture (20260630140000) never seeded a
-- France vs Spain match, and its whole synthetic schedule predates the current
-- date, so the Matches screen (which hides past days by default) rendered empty.
--
-- This additive migration inserts a France vs Spain Round-of-16 match kicking off
-- TODAY. Kickoff is derived from now() (not a hardcoded date) so the row always
-- lands on "today" whenever the migration is applied or the DB is reset. 15:00 UTC
-- keeps the local-tz calendar day stable across the Americas and Europe. The
-- ON CONFLICT DO UPDATE keeps the kickoff current on re-apply / `supabase db reset`.
--
-- Teams (France 31110000…05, Spain 31110000…0d), the active competition
-- (world-cup-2026, 11110000…01), and the Round of 16 phase (21110000…ff) are all
-- already seeded by 20260630140000_seed_dev_fixture.sql.

insert into public.matches
  (id, competition_id, phase_id, match_number, kickoff_at, status,
   home_team_id, away_team_id, home_placeholder, away_placeholder,
   home_score, away_score, winner_team_id)
values
  ('41110000-0000-0000-0000-00000000000f',
   '11110000-0000-0000-0000-000000000001',
   '21110000-0000-0000-0000-0000000000ff',
   15,
   date_trunc('day', now()) + interval '15 hours',
   'SCHEDULED',
   '31110000-0000-0000-0000-000000000005',  -- France
   '31110000-0000-0000-0000-00000000000d',  -- Spain
   null, null, null, null, null)
on conflict (id) do update set
  kickoff_at   = excluded.kickoff_at,
  status       = excluded.status,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  updated_at   = now();
