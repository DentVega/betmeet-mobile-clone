# Bolt V4 — Stage 1: Model (Realtime & Live)

> Intent 002 · unit `realtime-live`. Mostly client/JS + a projection RPC. Traces to US-RT1…RT4 / FR-RT1…RT4. Builds on V3 (realtime publication on `matches`/`prediction_scores`).

## Ubiquitous language
- **Live subscription** — a Supabase Realtime channel on `matches` + `prediction_scores`; any change invalidates the affected TanStack queries (`['fixture']`, `['ranking',*]`) so screens refetch without manual pull. Focus-refetch remains the fallback (NFR-4).
- **Live match** — `status='LIVE'` with a current `home_score/away_score`. No provider feed → an operator pushes live scores via `enter-result` (extended with an optional `status`).
- **Confirmed points** — from `prediction_scores` (only FINISHED matches; the V3 trigger clears non-finished).
- **Projected points** — `confirmed + Σ points(pick, live_score)` over LIVE matches, computed server-side in a projection RPC using the same scoring formula.
- **Live delta** — `confirmed_rank − projected_rank` per user (▲ up / ▼ down / — same) shown while matches are LIVE.
- **Live-now banner** — a badge shown when any relevant match is LIVE.

## Approach
1. **Single-source scoring** — extract the scoring formula into a scalar `fn_points(...)`; refactor `fn_score_match` (V3) to call it (re-validate V3 scenarios so no regression). The projection RPC reuses `fn_points` → one authoritative rule.
2. **Projection RPC** — `fn_global_ranking_live(p_limit)` returns `{user_id, nickname, avatar_url, confirmed_points, projected_points, confirmed_rank, projected_rank}`. Projected adds, per user, `fn_points` over their **global** predictions on LIVE matches. When no match is LIVE → projected = confirmed, ranks equal.
3. **`enter-result` +status** — accept optional `status` (`'LIVE'|'FINISHED'`, default FINISHED) so a live score can be pushed then finalized (trigger scores only on FINISHED; LIVE clears/keeps `prediction_scores` empty). Redeploy.
4. **Client**
   - `useLiveResults()` — one channel subscription (mounted in the app shell) → invalidate `['fixture']` + `['ranking',*]` on change; clean up on unmount.
   - `MatchCard` — show the scoreline for **LIVE** too (not only FINISHED); LIVE badge already themed.
   - **Live-now banner** — component shown in Matches (and Pool detail) when any match is LIVE.
   - `RankingsScreen` — consume the projection RPC; show **projected** points with a `confirmed → projected` hint + ▲/▼ delta while live; plain confirmed otherwise.

## Scope / invariants
- Projection is server-computed (RPC) so the client never needs every user's predictions; still RLS-safe (SECURITY DEFINER aggregate, no row exposure).
- Authoritative scoring stays the FINISHED trigger; projection is display-only and converges to it on FINISHED.
- **Pool-leaderboard live projection** is **deferred to V6** (it rides the membership-scoped pool-leaderboard rework, FR-PD7). V4 covers the **global** leaderboard + live status + banner.

## Out of model
Pool leaderboard live projection (V6); notification events (V10); real football-data live feed (deferred).
