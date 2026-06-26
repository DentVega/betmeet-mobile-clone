# Stories — Matches & Predictions

## US-M1 — Browse fixture by day — FR-M1
As a player I want matches grouped by day so that I can find upcoming games.
- AC: Given the matches screen, then matches are grouped by date in my device timezone and ordered by kickoff.
- AC: Given past days, then they're collapsed by default with a toggle to reveal them.
- AC: List renders via FlashList without scroll jank.

## US-M2 — See match + my prediction — FR-M2
As a player I want each match to show teams, time, status, and my prediction so that I know its state.
- AC: Given a match, then I see teams (or TBD placeholders), kickoff, a status badge, and my current prediction if I made one.

## US-M3 — Submit/edit a prediction — FR-M3
As a player I want to predict a score before kickoff so that I earn points.
- AC: Given a SCHEDULED match, when I enter home/away scores (and penalty winner if knockout) and submit, then the prediction is saved and reflected immediately.
- AC: Given kickoff has passed (LOCKED/LIVE/FINISHED), then the prediction is read-only.
- AC: Submitting invalidates cached fixture so the new value shows on refocus.

## US-M4 — See results & points — FR-M4
As a player I want finished matches to show the result and my points so that I can track performance.
- AC: Given a FINISHED match, then I see the actual score and the points I earned (read from server `PredictionScore`), with no client-side scoring.

## US-M5 — Refresh on focus — FR-M5
As a player I want fresh data when I open the screen so that statuses/results are current.
- AC: Given I focus the matches screen, then fixture + my predictions refetch per the cache `staleTime`.
