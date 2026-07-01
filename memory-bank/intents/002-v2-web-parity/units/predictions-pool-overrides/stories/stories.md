# Stories — Predictions: Pool Overrides

## US-PP1 — Per-pool override — FR-PP1
As a member I want a different pick for a specific pool.
- AC: from a pool I can set a prediction for a match distinct from my global pick (`pool_id` scope); it's used for that pool's scoring; my global pick is unchanged.
- AC: option to also save it as my global pick (`alsoSaveAsGlobal`).

## US-PP2 — Penalty-shootout bonus — FR-PP2
As a user I want my knockout penalty-winner pick to count.
- AC: on a knockout draw, choosing the penalty winner earns the bonus when correct; the earned points reflect base + penalty bonus (already computed server-side), shown in the UI.
