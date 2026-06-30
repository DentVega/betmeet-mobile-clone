# Bolt 9 — Test (Leaderboard & Rankings)

## Static / mobile
- `tsc --noEmit` — clean.
- `jest` — 51/51.
- Re.Pack/Rspack android bundle → **exit 0** (~4.9 MB).

## Backend — ranking RPCs on ephemeral PG17 (10 migrations applied)
Seeded users + the seeded FINISHED match + global predictions + scores (U1=5, U2=2; U3 none), pool P with members U1/U2/U3:
```
fn_global_ranking:    rank1 U1=5, rank2 U2=2        (U3 no global score → excluded)
fn_pool_leaderboard (member U1): U1=5, U2=2, U3=0   (member with 0 included)
fn_pool_leaderboard (non-member U4): OK (NOT_MEMBER) (membership enforced)
```
Rank/ties via SQL `rank()`; cross-user aggregation without exposing score rows (RLS-safe).

## Not covered here (needs deploy + device)
- Live rankings against the real project — after `db push` (ranking migration). No Edge Functions in this bolt (read RPCs only).
- Real points appear once `compute-score` has run on FINISHED matches (seed has 3) and users have submitted predictions.
- RNTL component tests deferred.

## User action
`supabase db push` (ranking_functions migration). RPCs are read-only `supabase.rpc` calls — no `functions deploy` needed for this bolt.
