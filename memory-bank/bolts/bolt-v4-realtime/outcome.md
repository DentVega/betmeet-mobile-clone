# Bolt V4 — Realtime & Live — Outcome

- **Status:** ✅ Complete (backend validated on PG; client verified on device; migration pushed + function deployed)
- **Intent:** 002-v2-web-parity · unit `realtime-live` · Stories US-RT1…RT4
- **DDD:** Model → Design+ADR-019 → Implement → Test (checkpoints approved)

## What shipped
- **Migration `20260701140000_live_projection.sql`**: `score_result` composite + `fn_points(...)` (single-source scoring); **refactored `fn_score_match` to call it**; `fn_global_ranking_live(p_limit)` RPC (confirmed + LIVE projection + confirmed/projected ranks).
- **`enter-result` + `status`** (`LIVE|FINISHED`) so a live score can be pushed then finalized.
- **`useLiveResults`** hook — one Supabase Realtime channel (matches + prediction_scores) → invalidates `['fixture']` + `['ranking']`; mounted in `AppTabs`.
- **`MatchCard`** shows the scoreline for LIVE (in the live color), not just FINISHED.
- **`LiveBanner`** — "live now (n)" from the cached fixture; on Matches + Rankings screens.
- **`useGlobalRankingLive` + `LiveRankRow` + `RankingsScreen`** — projected points with `confirmed → projected` + ▲/▼ rank delta while live.
- i18n `matches.liveNow`, `leaderboard.proj`.

## ADR
ADR-019 — server-computed projection RPC + single-source `fn_points` (chosen over shipping all predictions to the client / duplicating scoring in JS).

## Verification
PG17: refactor no-regression (5/3) + projection (u2 3→8 overtakes, ranks 2→1 / 1→2). tsc/jest clean. Device: Rankings loads via the new RPC on remote (no regression); banner/arrows correctly hidden without LIVE data.

## Activation (done)
`supabase db push` (13/13) + `functions deploy enter-result`.

## Carried forward
- **Pool-leaderboard live projection** → V6 (rides the membership-scoped rework, FR-PD7).
- Live visual demo with arrows needs a LIVE result pushed via `enter-result` (ADMIN_SECRET).
- Notification events on score/result changes → V10.

## Next
Bolt V5 — Pool Depth (backend): directed invites, owner controls, masked predictions grid, membership-scoped leaderboard RPC.
