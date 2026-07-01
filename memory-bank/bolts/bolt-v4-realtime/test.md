# Bolt V4 — Test (Realtime & Live)

## Backend (ephemeral PG17) — 13 migrations
- **Refactored `fn_score_match` via `fn_points`** — no regression: FINISHED group match → u1 EXACT 5, u2 RESULT 3 (matches V3).
- **`fn_global_ranking_live`** with a LIVE match (1-0):
  - u2: confirmed 3 → **projected 8** (predicted 1-0 exact live, +5), confirmed_rank 2 → **projected_rank 1** (overtakes).
  - u1: confirmed 5 → projected 6 (away-goal exact on live, +1), rank 1 → 2.
  - Confirms projection math + rank deltas; converges to confirmed when no LIVE match.

## Static
- `tsc --noEmit` clean; `jest` 54/54.

## Device (after db push + deploy)
- Migration `20260701140000` applied to remote (13/13); `enter-result` redeployed with `status`.
- **Rankings tab loads via `fn_global_ranking_live`** on remote — renders (empty state, since no scored matches yet), no error → RPC live + no regression.
- No LIVE matches on remote → LiveBanner hidden, no delta arrows (correct).
- `useLiveResults` subscription mounted in AppTabs (channel on matches + prediction_scores).

## Not covered (needs live data + admin secret)
- Visual live projection with ▲/▼ arrows + "confirmed → projected" on device — requires pushing a LIVE match via `enter-result` (needs the ADMIN_SECRET value, not in cleartext here). Projection correctness proven on PG.
- Realtime push latency (subscription verified to mount; end-to-end tick needs a live result write).
