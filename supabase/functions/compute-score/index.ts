// POST compute-score — maintenance op (NOT a user JWT; guarded by x-admin-secret).
// Computes prediction_scores for a FINISHED match; idempotent. FR-BK5.
// Invoke after entering a result (manual/seed in v1). verify_jwt = false.
import { adminClient } from '../_shared/clients.ts';
import { cors, json } from '../_shared/respond.ts';
import { computeScore, type Side } from '../_shared/scoring.ts';

const sideOf = (teamId: string | null, home: string | null, away: string | null): Side =>
  teamId && teamId === home ? 'home' : teamId && teamId === away ? 'away' : null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.headers.get('x-admin-secret') !== Deno.env.get('ADMIN_SECRET')) {
    return json({ ok: false, code: 'UNAUTHENTICATED', message: 'bad admin secret' }, 401);
  }
  try {
    const { matchId } = (await req.json().catch(() => ({}))) as { matchId?: string };
    if (!matchId) return json({ ok: false, code: 'INVALID', message: 'matchId required' });

    const sb = adminClient();
    const { data: match, error: mErr } = await sb
      .from('matches')
      .select('id,status,home_score,away_score,home_team_id,away_team_id,winner_team_id,phase_id')
      .eq('id', matchId)
      .single();
    if (mErr || !match) return json({ ok: false, code: 'NOT_FOUND', message: 'match' }, 404);

    const scoreable = match.status === 'FINISHED' && match.home_score !== null && match.away_score !== null;
    if (!scoreable) {
      await sb.from('prediction_scores').delete().eq('match_id', matchId);
      return json({ ok: true, scoreable: false, scored: 0 });
    }

    const { data: phase } = await sb.from('competition_phases').select('type').eq('id', match.phase_id).single();
    const isKnockout = phase?.type === 'KNOCKOUT';
    const winnerSide = sideOf(match.winner_team_id, match.home_team_id, match.away_team_id);

    const { data: preds, error: pErr } = await sb
      .from('predictions')
      .select('id,user_id,home_score,away_score,penalty_winner_team_id')
      .eq('match_id', matchId);
    if (pErr) return json({ ok: false, code: 'INTERNAL', message: pErr.message }, 500);

    const now = new Date().toISOString();
    const rows = (preds ?? []).map((p) => {
      const s = computeScore(
        {
          home: p.home_score,
          away: p.away_score,
          penaltyWinnerSide: sideOf(p.penalty_winner_team_id, match.home_team_id, match.away_team_id),
        },
        { home: match.home_score, away: match.away_score, winnerSide },
        isKnockout,
      );
      return {
        prediction_id: p.id,
        match_id: matchId,
        user_id: p.user_id,
        matched_case: s.matched_case,
        base_points: s.base_points,
        penalty_applied: s.penalty_applied,
        penalty_points: s.penalty_points,
        total_points: s.total_points,
        scored_at: now,
      };
    });

    if (rows.length > 0) {
      const { error: uErr } = await sb.from('prediction_scores').upsert(rows, { onConflict: 'prediction_id' });
      if (uErr) return json({ ok: false, code: 'INTERNAL', message: uErr.message }, 500);
    }
    return json({ ok: true, scoreable: true, scored: rows.length });
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
