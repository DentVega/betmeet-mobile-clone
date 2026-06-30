// Deno test for the scoring rules (run: `deno test supabase/functions/_shared/scoring.test.ts`).
import { assertEquals } from 'jsr:@std/assert@1';
import { computeScore } from './scoring.ts';

Deno.test('EXACT — both scores match → 5', () => {
  const r = computeScore({ home: 2, away: 1, penaltyWinnerSide: null }, { home: 2, away: 1, winnerSide: 'home' }, false);
  assertEquals(r.matched_case, 'EXACT');
  assertEquals(r.base_points, 5);
  assertEquals(r.total_points, 5);
});

Deno.test('RESULT — correct winner + one exact goal → 2+1', () => {
  const r = computeScore({ home: 2, away: 0, penaltyWinnerSide: null }, { home: 2, away: 1, winnerSide: 'home' }, false);
  assertEquals(r.matched_case, 'RESULT');
  assertEquals(r.base_points, 3); // result 2 + home goal 1
});

Deno.test('PARTIAL — wrong result but a goal matches → 1', () => {
  const r = computeScore({ home: 1, away: 0, penaltyWinnerSide: null }, { home: 1, away: 2, winnerSide: 'away' }, false);
  assertEquals(r.matched_case, 'PARTIAL');
  assertEquals(r.base_points, 1); // home goal only
});

Deno.test('MISS — nothing correct → 0', () => {
  const r = computeScore({ home: 0, away: 0, penaltyWinnerSide: null }, { home: 1, away: 2, winnerSide: 'away' }, false);
  assertEquals(r.matched_case, 'MISS');
  assertEquals(r.base_points, 0);
});

Deno.test('Penalty bonus — knockout draw, correct shootout side → +1', () => {
  const r = computeScore({ home: 1, away: 1, penaltyWinnerSide: 'home' }, { home: 1, away: 1, winnerSide: 'home' }, true);
  assertEquals(r.matched_case, 'EXACT');
  assertEquals(r.penalty_applied, true);
  assertEquals(r.total_points, 6); // 5 + 1
});

Deno.test('No penalty bonus in group stage even if draw + side set', () => {
  const r = computeScore({ home: 1, away: 1, penaltyWinnerSide: 'home' }, { home: 1, away: 1, winnerSide: 'home' }, false);
  assertEquals(r.penalty_applied, false);
  assertEquals(r.total_points, 5);
});

Deno.test('No penalty bonus when shootout side wrong', () => {
  const r = computeScore({ home: 2, away: 2, penaltyWinnerSide: 'away' }, { home: 2, away: 2, winnerSide: 'home' }, true);
  assertEquals(r.penalty_applied, false);
  assertEquals(r.total_points, 5);
});
