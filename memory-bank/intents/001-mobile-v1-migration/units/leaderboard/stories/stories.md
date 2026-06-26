# Stories — Leaderboard & Rankings

## US-L1 — Global ranking — FR-L1
As a player I want a global ranking so that I see how I compare to everyone.
- AC: Given the rankings tab, then I see players ordered by total points with rank, nickname, and avatar; my row is highlighted.
- AC: Given matches in progress, then a live projection is reflected (read from the server projection query).
- AC: List renders via FlashList.

## US-L2 — Pool leaderboard — FR-L2
As a pool member I want a per-pool leaderboard so that I see standings among friends.
- AC: Given a pool's leaderboard (from pool detail), then members are ranked by pool points with rank, nickname, avatar.

## US-L3 — Read-only & fresh — FR-L3
As a player I want standings to be current and trustworthy so that I rely on them.
- AC: Given any leaderboard, then no scoring happens on the client — values come from the server.
- AC: Given I focus a leaderboard, then it refetches per cache `staleTime`.
