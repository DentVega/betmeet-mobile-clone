# Bolt 4 — Stage 1: Model (Backend Edge Functions)

> Phase B. Server-side write logic for v1, ported from the betmeet-clone server actions (exact rules extracted). Functions verify the caller JWT and perform privileged, atomic writes; the schema/RLS from Bolt 3 is the substrate. Traces to FR-BK3/4/5.

## Operations (v1 scope)
`save-prediction` · `create-pool` · `join-pool` · `compute-score`. (Nickname/`set-nickname`, `leave`/`kick`/`delete-pool` belong to their feature bolts — 6 and 8 — and are out of Bolt 4.)

## Auth model
Every function reads the `Authorization: Bearer <JWT>` header → resolves `auth.uid()` (the caller). Authorization checks run in code; the atomic DB mutation runs with privileges (service role / SECURITY DEFINER), so it bypasses RLS only *after* the function has authorized the action.

## Scoring domain (compute-score) — exact rules
Constants: `EXACT=5, CORRECT_RESULT=2, PARTIAL_GOAL=1 (per team), MISS=0, PENALTY_BONUS=1`.
```
sign(x) = x>0?1 : x<0?-1 : 0
if predHome==actHome && predAway==actAway:
    matched_case=EXACT,  base=5
else:
    result = (sign(predH-predA)==sign(actH-actA)) ? 2 : 0
    homeGoal = (predH==actH) ? 1 : 0
    awayGoal = (predA==actA) ? 1 : 0
    base = result + homeGoal + awayGoal
    matched_case = result>0 ? RESULT : (homeGoal||awayGoal) ? PARTIAL : MISS
penalty_applied = isKnockout && actH==actA && predPenWinnerSide!=null && predPenWinnerSide==actualWinnerSide
penalty_points  = penalty_applied ? 1 : 0
total = base + penalty_points
```
- `isKnockout` = match.phase.type == KNOCKOUT. `actualWinnerSide` = side of `match.winner_team_id`; `predPenWinnerSide` = side of `prediction.penalty_winner_team_id`.
- **Scoreable** only if `status=FINISHED AND home_score,away_score NOT NULL`. Otherwise **delete** that match's `prediction_scores` (cleanup for cancelled/postponed).
- **Idempotent**: bulk `INSERT … ON CONFLICT (prediction_id) DO UPDATE` (safe to re-run after a result correction). Missing predictions = no row (no penalty row invented).

## save-prediction — rules
Input: `{ matchId, homeScore, awayScore, penaltyWinnerTeamId?, poolId?, alsoSaveAsGlobal? }`.
1. Auth + **onboarding required** (no nickname/profile gate → reject).
2. Range: home/away integer 0–20 (DB CHECK also).
3. If `poolId`: caller must be an active member of that pool.
4. **Eligibility** (editable iff ALL): `status=SCHEDULED`, `kickoff_at` in the future, both `home_team_id`/`away_team_id` set. Otherwise: if an unlocked row exists, **lock it** (`locked_at=now`, reason ∈ {KICKOFF_REACHED, MATCH_STATUS_LOCKED, MATCH_NOT_EDITABLE, POSTPONED, CANCELLED}) and return a "locked" result.
5. Penalty winner: required **only** when KNOCKOUT **and** predicted draw, and must equal home or away team; otherwise forced to null.
6. Write (upsert per scope `pool_id ?? null`): if a locked row is being re-saved while still editable, clear the lock first (two-step, because `prediction_lock_guard` rejects score changes while locked). `alsoSaveAsGlobal && poolId` ⇒ two upserts (global + pool) **atomically**.

## create-pool — rules
Input: `{ name(3–60), type(PUBLIC|PRIVATE), capacity(2–100), membersCanInvite=true }`.
1. Auth + onboarding required.
2. If PUBLIC: name must be unique among public pools (pre-check + partial-unique index guard).
3. Invite token: charset `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (31, no ambiguous), length 8, up to 5 retries on collision, fallback length 12. Column is `varchar(12) unique`.
4. **Atomic**: insert pool + insert owner `pool_membership` (all-or-nothing).

## join-pool — rules
Input: `{ poolId }` (public) **or** `{ token }`.
- Token is normalized to **UPPERCASE**; length 6–12.
- Public path: pool must be `type=PUBLIC`.
- Already a member ⇒ **idempotent** success (`{ alreadyMember:true, poolId }`), not an error.
- Capacity: reject when `memberCount >= capacity` (owner counts; "FULL").
- Allowed **anytime** (no competition-start freeze). Errors: FULL, NOT_FOUND (bad token / non-public).

## Invariants
- A locked prediction's scores never change (DB trigger), regardless of path.
- Pool capacity and public-name uniqueness are enforced server-side + by DB constraints (defense in depth).
- Scoring is deterministic + idempotent; re-running after a result edit converges.
- Functions authorize before privileged writes; no function trusts client-supplied user ids (always `auth.uid()` from the JWT).

## Out of model
Exact transport (Deno function vs SQL RPC split), deployment, and tests → Design/Implement. Match/team seed → Bolt 5.
