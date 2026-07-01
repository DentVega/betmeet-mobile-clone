# Stories — Results & Auto-scoring

## US-RS1 — Enter result — FR-RS1
As an authorized operator I want to enter a match result.
- AC: a guarded surface accepts score (+ penalties/winner) and sets the match FINISHED; normal users can't access it.

## US-RS2 — Auto-scoring — FR-RS2
As the system I want scores computed automatically when a match finishes.
- AC: when a match becomes FINISHED with scores, `prediction_scores` are computed automatically (trigger/function) for all predictions — no manual `compute-score` call needed; idempotent on re-entry.

## US-RS3 — Revert result — FR-RS3
As an operator I want to undo a wrong result.
- AC: reverting clears the match result and deletes the affected `prediction_scores`; leaderboards recede accordingly.

## US-RS4 — Emit events — FR-RS4
As the system I want result/scoring changes to notify + go live.
- AC: finishing/scoring a match emits Realtime updates + notification outbox events (match-end, goal, rank-up) consumed by the Realtime and Notifications units.
