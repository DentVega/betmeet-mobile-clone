import { scorePreview } from '../scoring';

describe('scorePreview', () => {
  it('exact score → 5', () => {
    expect(scorePreview({ h: 2, a: 1 }, { h: 2, a: 1 }, false)).toMatchObject({ exact: true, total: 5 });
  });
  it('result + one goal → 3 (example BRA 2-1 vs pred 3-2)', () => {
    // pred 3-2 (home win), actual 2-1 (home win): result 2 + away-goal? pred away 2 vs 1 no; home 3 vs 2 no → 2
    const b = scorePreview({ h: 3, a: 2 }, { h: 2, a: 1 }, false);
    expect(b.result).toBe(2);
    expect(b.total).toBe(2);
  });
  it('result + away-goal → 3 (pred 2-1 vs actual 3-1)', () => {
    const b = scorePreview({ h: 2, a: 1 }, { h: 3, a: 1 }, false);
    expect(b).toMatchObject({ result: 2, awayGoal: 1, total: 3 });
  });
  it('miss → 0', () => {
    expect(scorePreview({ h: 0, a: 3 }, { h: 2, a: 0 }, false).total).toBe(0);
  });
  it('knockout draw + correct penalty winner → +1 bonus', () => {
    const b = scorePreview({ h: 1, a: 1, pen: 'home' }, { h: 1, a: 1, win: 'home' }, true);
    expect(b).toMatchObject({ exact: true, penalty: 1, total: 6 });
  });
  it('knockout draw + wrong penalty winner → no bonus', () => {
    const b = scorePreview({ h: 0, a: 0, pen: 'away' }, { h: 1, a: 1, win: 'home' }, true);
    expect(b.penalty).toBe(0);
  });
});
