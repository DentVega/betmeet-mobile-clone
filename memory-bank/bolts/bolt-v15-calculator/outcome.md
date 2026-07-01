# Bolt V15 — Interactive scoring calculator — Outcome

- **Status:** ✅ Complete (verified on device). Intent 007 (condensed). Closes parity-matrix MISSING #1. JS-only, host bundle, no native module.

## What shipped
- `src/education/scoring.ts` — pure `scorePreview(pred, actual, isKnockout)` mirroring fn_points / _shared/scoring.ts.
- `src/education/ScoreCalculator.tsx` — steppers (prediction + actual, 0–20), knockout switch + penalty-winner pickers, live breakdown (exact/result/home-goal/away-goal/penalty) + total.
- Rendered atop the Rules tab (`RulesScreen`). i18n `calc.*`. Jest test `scoring.test.ts` (6 cases).

## Verification
tsc clean; jest 60/60 (+6). Device: default pred 2-1 vs actual 2-1 → Marcador exacto +5, Total 5; bumping prediction to 2-2 recomputed live to Resultado 0 / Gol local +1 / Total 1 — correct per the rules.

## Parity
parity-matrix.md updated: COVERED 17, MISSING 0. Migration parity complete.
