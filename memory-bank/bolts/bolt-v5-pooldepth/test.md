# Bolt V5 — Test (Pool Depth — backend)

## Backend (ephemeral PG17) — 14 migrations, all RPCs
Setup: pool Alpha (owner u1, members_can_invite=false), members u1/u3 (early), u2 (late), outsider u4; a FINISHED match `mx` (2-1, kickoff −10d) and a future `mf` (+2d); global preds + a u1 pool override on mx.

| # | Check | Expected | Got |
|---|---|---|---|
| A | `fn_search_nicknames('ea')` | early#0003 | ✅ |
| B | member invites while flag off | NOT_ALLOWED | ✅ |
| B2 | owner invites / duplicate | ok / ALREADY_INVITED | ✅ |
| C | outsider accepts invite | becomes member | ✅ |
| D | rename to an existing public name | NAME_TAKEN | ✅ |
| E | archive → discover | excluded (0) | ✅ |
| F | masking (as u1) — mx | own=override 3-3 shown, u3 (early, past) revealed 1-0, u2/u4 (pre-join) null | ✅ |
| F | masking — mf (future) | own 1-0 shown, others null (not revealed) | ✅ |
| G | scoped leaderboard | owner=0 (**override** used, not global 5); late=0 (joined after mx → excluded); early=2 (RESULT) | ✅ |
| G | move late's join before mx | late=5 (EXACT now counted) | ✅ |

Confirms: permission gate, capacity/dedupe, invite accept, name-uniqueness, archive exclusion, **server-side masking** (future picks never leak; pre-join empty), **effective-prediction precedence** (override over global) and **membership scoping** (kickoff ≥ joined).

## Static
- SQL-only bolt; no client code → `tsc`/`jest` unaffected (54/54); `supabase/` excluded.

## Not covered (V6)
- Mobile UI (invite form, settings panel, predictions grid, scoped leaderboard screen).
- Pool-leaderboard **live** projection (V6, extends V4).
- Invite notification (V10).
