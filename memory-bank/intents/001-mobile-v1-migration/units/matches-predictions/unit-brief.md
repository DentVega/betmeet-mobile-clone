# Unit: Matches & Predictions

> Part of Intent 001 — Betmeet Mobile v1. Mirrors web `src/features/predictions` + `src/features/competition`.

## Purpose
Show the World Cup fixture grouped by day and let users submit/edit predictions before kickoff. Display results and earned points after matches finish.

## In scope (v1)
- Fixture grouped by day in device-local timezone; past days collapsed with toggle (FR-M1).
- Match row: teams or TBD placeholders, kickoff, status badge, user's current prediction (FR-M2).
- Submit/edit prediction (home/away score + penalty winner on knockout); lock at kickoff (FR-M3).
- Finished match shows result + earned points read from server `PredictionScore` (FR-M4).
- Refetch on focus and after submit (FR-M5).

## Out of scope (v1)
- Client-side scoring — all scoring stays server-side (read-only on mobile).
- Live realtime push of scores — polling/focus refetch acceptable in v1.

## Requirements covered
FR-M1 … FR-M5. (Backend mirror: web FR-REFINE-16.2, 30.*, 36.*)

## Screens
Matches list (FlashList, day-grouped) + inline/modal prediction form.

## Key integrations
- Reads: fixture-by-day with the user's predictions (PostgREST select mirroring `getFixtureByDayWithMyPredictions`).
- Write: `savePrediction` (upsert) — **write-path audit required** (lock-at-kickoff is server-enforced; verify RLS/RPC).
- Client cache (React Query candidate) with focus refetch + invalidate-on-submit.

## Dependencies
- **Depends on:** Auth session; App-shell tabs + data layer.
- **Relates to:** Leaderboard (predictions drive scores).

## Topology
Host bundle in v1; **plausible first federated remote** if/when MF is adopted (self-contained surface).

## Risk notes
- `savePrediction` is the canonical write-path risk (server action today). First bolt must confirm a callable path before building the form.
- Timezone day-grouping must use device-local tz (parity with web FR-REFINE-16.2).

## Stories
See `stories/` (US-M1 … US-M5).
