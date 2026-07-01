/** Pure scoring preview for the calculator — mirrors fn_points / _shared/scoring.ts. */
export type Side = 'home' | 'away' | null;

export interface ScorePred {
  h: number;
  a: number;
  pen?: Side;
}
export interface ScoreActual {
  h: number;
  a: number;
  win?: Side;
}

export interface ScoreBreakdown {
  exact: boolean;
  result: number; // 0 or 2
  homeGoal: number; // 0 or 1
  awayGoal: number; // 0 or 1
  base: number;
  penalty: number; // 0 or 1
  total: number;
}

const sign = (x: number): number => (x > 0 ? 1 : x < 0 ? -1 : 0);

export function scorePreview(pred: ScorePred, act: ScoreActual, isKnockout: boolean): ScoreBreakdown {
  let exact = false;
  let result = 0;
  let homeGoal = 0;
  let awayGoal = 0;
  let base = 0;

  if (pred.h === act.h && pred.a === act.a) {
    exact = true;
    base = 5;
  } else {
    result = sign(pred.h - pred.a) === sign(act.h - act.a) ? 2 : 0;
    homeGoal = pred.h === act.h ? 1 : 0;
    awayGoal = pred.a === act.a ? 1 : 0;
    base = result + homeGoal + awayGoal;
  }

  const penalty =
    isKnockout && act.h === act.a && !!pred.pen && pred.pen === (act.win ?? null) ? 1 : 0;

  return { exact, result, homeGoal, awayGoal, base, penalty, total: base + penalty };
}
