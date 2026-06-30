// Pure scoring — ported verbatim from betmeet-clone (scoring-rules + compute-score).
// EXACT 5; else RESULT(2) + per-team exact goal(1 each); PENALTY bonus +1.

export type MatchedCase = 'EXACT' | 'RESULT' | 'PARTIAL' | 'MISS';
export type Side = 'home' | 'away' | null;

export interface ScoreResult {
  matched_case: MatchedCase;
  base_points: number;
  penalty_applied: boolean;
  penalty_points: number;
  total_points: number;
}

const sign = (x: number): number => (x > 0 ? 1 : x < 0 ? -1 : 0);

export function computeScore(
  pred: { home: number; away: number; penaltyWinnerSide: Side },
  actual: { home: number; away: number; winnerSide: Side },
  isKnockout: boolean,
): ScoreResult {
  let matched_case: MatchedCase;
  let base_points: number;

  if (pred.home === actual.home && pred.away === actual.away) {
    matched_case = 'EXACT';
    base_points = 5;
  } else {
    const result = sign(pred.home - pred.away) === sign(actual.home - actual.away) ? 2 : 0;
    const homeGoal = pred.home === actual.home ? 1 : 0;
    const awayGoal = pred.away === actual.away ? 1 : 0;
    base_points = result + homeGoal + awayGoal;
    matched_case = result > 0 ? 'RESULT' : homeGoal || awayGoal ? 'PARTIAL' : 'MISS';
  }

  const penalty_applied =
    isKnockout &&
    actual.home === actual.away &&
    pred.penaltyWinnerSide !== null &&
    pred.penaltyWinnerSide === actual.winnerSide;
  const penalty_points = penalty_applied ? 1 : 0;

  return {
    matched_case,
    base_points,
    penalty_applied,
    penalty_points,
    total_points: base_points + penalty_points,
  };
}
