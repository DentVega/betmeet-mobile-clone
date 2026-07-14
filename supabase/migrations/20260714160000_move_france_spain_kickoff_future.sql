-- Fix: "can't make predictions — the match already started."
--
-- Not a timezone bug. canEdit() gates on the ABSOLUTE instant
-- (new Date(kickoff_at) > now()) and status = 'SCHEDULED'. The display timezone
-- only changes how the kickoff is rendered, not the instant itself. The prior
-- seed (20260714120000) set kickoff to today 15:00 UTC, which has already passed
-- in real time, so the demo match is genuinely locked.
--
-- This moves the demo France vs Spain kickoff to a few hours in the FUTURE so the
-- prediction flow is testable, and resets it to SCHEDULED. It stays on "today" in
-- both UTC and the Americas. Re-run this (or `supabase db reset`) if real time
-- catches up to the kickoff again.

update public.matches
set
  kickoff_at = now() + interval '3 hours',
  status     = 'SCHEDULED',
  updated_at = now()
where id = '41110000-0000-0000-0000-00000000000f';
