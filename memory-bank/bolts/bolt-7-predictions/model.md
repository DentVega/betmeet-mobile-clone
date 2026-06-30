# Bolt 7 — Stage 1: Model (Matches & Predictions)

> Phase C mobile bolt. The fixture (grouped by day) + prediction submit/edit before kickoff, results + earned points after. Reads via RLS; the write goes through the `save-prediction` Edge Function (Bolt 4). Traces to `units/matches-predictions/` (US-M1…M5).

## Ubiquitous language
- **Fixture** — the list of `matches` for the active competition, **grouped by day** in the device-local timezone.
- **MatchCard** — one match: teams (or TBD placeholders), kickoff, status badge, the user's current prediction, and (if FINISHED) result + earned points.
- **Prediction** — `{ home_score, away_score, penalty_winner_team_id? }` for a match, in the global scope (`pool_id = null`) for v1's Matches tab. (Pool-scoped predictions arrive with Pools, Bolt 8.)
- **Editable** — a match accepts predictions only while `status=SCHEDULED`, kickoff in the future, both teams set (mirrors the server `fn_save_prediction` eligibility; the client only shows the form when editable — the server is authoritative).
- **Earned points** — from `prediction_scores` (server-computed by `compute-score`); read-only.

## Pure domain (test surface)
- **`groupMatchesByDay(matches, timeZone) → Day[]`** — bucket matches into local-tz calendar days, ordered; within a day, ordered by kickoff. `Day = { dateKey, label, matches }`. Pure.
- **`isPast(day, now)`** — for the "past days collapsed by default" toggle (US-M1). Pure.
- **`canEdit(match, now)`** — mirror of server eligibility for showing/hiding the form (advisory; server enforces). Pure.

## Read shape (PostgREST + RLS)
One query over `matches` for the active competition, embedding:
- `home_team`, `away_team` (→ `teams`) for names/flags; `phase` (→ `competition_phases.type`) to know knockout (penalty input).
- the caller's `predictions` (RLS `select_own` → only mine; global scope filter `pool_id is null`) and `prediction_scores` (RLS own) for points.
Result is shaped client-side into `Day[] → MatchCard[]`. No aggregation server-side; cached in TanStack Query with focus refetch + invalidate-on-submit.

## Write
- Submit/edit → `supabase.functions.invoke('save-prediction', { body:{ matchId, homeScore, awayScore, penaltyWinnerTeamId?, poolId:null } })`.
- The function enforces eligibility/lock/penalty rules; the client maps `{ok:false, code}` (`LOCKED`, `NOT_ONBOARDED`, `INVALID`) to messages and refetches the fixture on success.
- Penalty-winner input shown only when the match phase is KNOCKOUT and the entered scores are a draw.

## Invariants
- The client never writes `predictions`/`prediction_scores` directly for scoring; submit goes through the function (lock + rules server-side).
- A locked/finished match renders read-only (form hidden); the server rejects late writes regardless.
- Points shown are exactly the server `prediction_scores` (no client scoring).

## Out of model
Pool-scoped predictions (Bolt 8), leaderboard (Bolt 9), live realtime updates (polling/focus refetch only in v1), entering results (maintenance/compute-score).
