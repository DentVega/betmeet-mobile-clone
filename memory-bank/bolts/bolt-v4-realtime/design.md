# Bolt V4 — Stage 2: Design + ADR-019 (Realtime & Live)

## ADR-019 — Server-computed live projection (RPC) + single-source scoring
- **Decision:** compute the live leaderboard projection in a SECURITY DEFINER RPC (`fn_global_ranking_live`) reusing a new scalar `fn_points(...)` that `fn_score_match` (V3) also calls. The client subscribes to Realtime and invalidates queries; it never receives all users' predictions.
- **Alternatives:** ship every LIVE-match prediction to the client and project locally (rejected — data volume + duplicate scoring logic in JS). Keep scoring only in the trigger (rejected — projection needs the same rule).
- **Consequences:** one authoritative scoring rule in the DB (`fn_points`); projection is RLS-safe and cheap (LIVE matches are few); JS holds no scoring logic.

## Backend — migration `20260701140000_live_projection.sql`
- `score_result` composite type (matched_case, base_points, penalty_applied, penalty_points, total_points) — guarded create.
- `fn_points(p_ph,p_pa,p_pw, m_h,m_a,m_ht,m_at,m_win, is_ko) returns score_result` (plpgsql, immutable) — the verbatim rule.
- **Refactor `fn_score_match`** to call `fn_points` (breakdown stored as before) — re-validate V3 scenarios.
- `fn_global_ranking_live(p_limit) returns (user_id,nickname,avatar_url,confirmed_points,projected_points,confirmed_rank,projected_rank)` — confirmed = Σ `prediction_scores` (global); projected = confirmed + Σ `fn_points` over the user's global predictions on `status='LIVE'` matches; ranks via `rank() over`. Grant to `authenticated`.
- **`enter-result`**: optional `status` (`'LIVE'|'FINISHED'`, default FINISHED) → allows pushing a live score. Redeploy.

## Client
- **`src/session/useLiveResults.ts`** — one `supabase.channel('live-results')` with `postgres_changes` on `matches` + `prediction_scores`; on change → `invalidateQueries(['fixture'])` + `(['ranking'])`; remove channel on unmount. Mounted in `AppTabs`.
- **`MatchCard`** — show the scoreline when `status` is **LIVE** or FINISHED (was FINISHED-only). LIVE badge already themed.
- **`src/matches/components/LiveBanner.tsx`** — self-contained; reads `useFixture` (cached), counts LIVE matches, renders a "🔴 live now (n)" banner or null. Placed in `MatchesScreen` + `PoolDetailScreen`.
- **`useGlobalRankingLive`** (new hook) + **`RankingsScreen`** — render **projected** points with a `confirmed → projected` hint + ▲/▼ delta (`confirmed_rank − projected_rank`) while live; plain confirmed otherwise.
- i18n: `matches.liveNow`, `leaderboard.proj`.

## Test
- Backend on ephemeral PG: re-validate `fn_score_match` (V3 scenarios via `fn_points`); `fn_global_ranking_live` with a LIVE match → projected > confirmed + correct rank delta; no LIVE → projected = confirmed.
- tsc + jest; device: set a match LIVE via `enter-result`, confirm the fixture shows the live score + banner and the ranking projects, updating live via the subscription.
