# Stories — Realtime & Live

## US-RT1 — Live subscription — FR-RT1
As a user I want the app to update when results change without manual refresh.
- AC: a Realtime subscription on match/score changes invalidates the relevant queries; if the socket drops, focus-refetch still updates.

## US-RT2 — Live match status — FR-RT2
As a user I want live matches to show live.
- AC: a LIVE match shows a LIVE badge + current scoreline that updates in place as the result changes.

## US-RT3 — "Live now" banner in pools — FR-RT3
As a pool member I want to see when a member's match is live.
- AC: a "live now" banner appears in the pool while a relevant match is LIVE, with the member's pick.

## US-RT4 — Live leaderboard projection — FR-RT4
As a user I want to see projected standings during live matches.
- AC: while matches are LIVE, the leaderboard shows projected points (`confirmed + Σ computeScore(pick, liveScore)`), reorders, and shows "14 → 19" with ▲/▼ deltas; on FINISHED it converges to the authoritative score.
