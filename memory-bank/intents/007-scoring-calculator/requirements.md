# Intent 007 — Interactive scoring calculator (condensed spec)

> Closes the last parity gap (parity-matrix.md MISSING #1). Small widget → right-sized. Host bundle, no native module.

## Business intent
Port the web Rules Center's interactive **scoring calculator** (`scoring-calculator.tsx` / `score-breakdown-demo.tsx`): enter a predicted score + an actual score and see the points computed live, with the breakdown.

## Functional requirements
- **FR-C1** Inputs for **your prediction** (home/away) and the **actual result** (home/away) via steppers (0–20).
- **FR-C2** A **knockout** toggle; when on and a side is a draw, pick the penalty winner (predicted + actual) → applies the +1 bonus.
- **FR-C3** Live **breakdown**: exact(5) OR result(2)+home-goal(1)+away-goal(1), + penalty bonus, + total — mirroring the exact server rule.
- **FR-C4** Lives in the Rules tab (a card above the accordion); bilingual + themed.

## Design (host bundle, no native module)
- **`src/education/scoring.ts`** — pure `scorePreview(pred, actual, isKnockout)` → `{ exact, result, homeGoal, awayGoal, penalty, total }` (same rule as `fn_points`/`_shared/scoring.ts`).
- **`src/education/ScoreCalculator.tsx`** — steppers + knockout switch + penalty pickers + breakdown, driven by `scorePreview`.
- **`RulesScreen`** — render `<ScoreCalculator/>` above the accordion.
- **i18n** `calc.*`. Unit test for `scorePreview` (exact/result/partial/miss/penalty).

## Bolt plan (single bolt: V15)
Implement scoring.ts + ScoreCalculator + wire + i18n + a jest test. Verify tsc/jest + device.
