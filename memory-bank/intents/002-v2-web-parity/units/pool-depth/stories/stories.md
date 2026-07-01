# Stories — Pool Depth

## US-PD1 — Directed invites — FR-PD1
As an owner/member I want to invite people by email or nickname.
- AC: nickname typeahead searches users; sending creates an invite record + notification; the invitee can accept → joins.

## US-PD2 — Members-can-invite — FR-PD2
As an owner I want to control who can invite.
- AC: toggling the permission enables/disables invites by non-owner members (private + public).

## US-PD3 — Rename pool — FR-PD3
As an owner I want to rename my pool.
- AC: rename with confirmation; public-name uniqueness enforced; reflected everywhere.

## US-PD4 — Change visibility — FR-PD4
As an owner I want to switch public↔private.
- AC: switch is optimistic; making public checks name uniqueness; discover reflects the change.

## US-PD5 — Archive / settings panel — FR-PD5
As an owner I want a settings panel and to archive a pool.
- AC: a settings panel groups rename/visibility/members-can-invite/archive; archiving hides it from active lists.

## US-PD6 — Predictions-in-pool grid — FR-PD6
As a member I want to see everyone's picks per day.
- AC: a per-day grid shows members' picks + points, visible from kickoff; **future picks of others are hidden** until lock; non-members see empty "not in pool yet" cells.

## US-PD7 — Membership-scoped leaderboard — FR-PD7
As a member I want the pool leaderboard to count only my time in the pool.
- AC: only matches with `kickoff_at ≥ joined_at` count, using my pool override else my global pick; ranking reflects that (not raw global totals).
