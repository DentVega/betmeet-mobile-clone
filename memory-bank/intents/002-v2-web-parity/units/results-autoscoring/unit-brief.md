# Unit: Results & Auto-scoring

> Intent 002 (v2). Mirrors web Units 6/31/35/50 (force/revert result, auto-scoring). NO live football-data sync, NO full admin panel.

## Purpose
Enter/edit match results (minimal, guarded) and auto-compute scores when a match finishes, feeding Realtime + notifications. Replaces v1's manual `compute-score` invocation.

## In scope
FR-RS1 minimal result-entry (guarded) · FR-RS2 auto-scoring sweeper on FINISHED (trigger/Edge Function) · FR-RS3 revert result (+ delete scores) · FR-RS4 emit Realtime + notification events.

## Out of scope
Live football-data.org sync + crons (deferred); full admin dashboard (web-only).

## Integrations
`enter-result` Edge Function (guarded by admin secret / restricted role); DB trigger on `matches`→FINISHED invoking scoring (plpgsql or pg_net→Edge Function); reuses Bolt-4 `compute-score` logic; emits to Realtime + notification outbox.

## Dependencies
Depends on: schema + `compute-score` (v1). Provides: fresh scores → consumed by Realtime, Leaderboard, Notifications.

## Native module
None (backend).

## Risk
Trigger vs Edge-Function scoring choice (Q5 surface); idempotency + revert correctness; keeping result-entry guarded (not a normal-user capability).

## Stories
`stories/` (US-RS1…RS4).
