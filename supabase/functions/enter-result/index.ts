// POST enter-result — maintenance op (NOT a user JWT; guarded by x-admin-secret).
// Sets/edits or reverts a match result; the DB trigger auto-scores (FR-RS1/RS3). verify_jwt = false.
import { adminClient } from '../_shared/clients.ts';
import { cors, json } from '../_shared/respond.ts';

interface Body {
  matchId?: string;
  homeScore?: number;
  awayScore?: number;
  winnerTeamId?: string | null;
  status?: 'LIVE' | 'FINISHED';
  revert?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.headers.get('x-admin-secret') !== Deno.env.get('ADMIN_SECRET')) {
    return json({ ok: false, code: 'UNAUTHENTICATED', message: 'bad admin secret' }, 401);
  }
  try {
    const { matchId, homeScore, awayScore, winnerTeamId, status, revert } = (await req
      .json()
      .catch(() => ({}))) as Body;
    if (!matchId) return json({ ok: false, code: 'INVALID', message: 'matchId required' });

    const sb = adminClient();

    if (revert) {
      const { error } = await sb
        .from('matches')
        .update({ status: 'SCHEDULED', home_score: null, away_score: null, winner_team_id: null })
        .eq('id', matchId);
      if (error) return json({ ok: false, code: 'INTERNAL', message: error.message }, 500);
      return json({ ok: true, reverted: true });
    }

    if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
      return json({ ok: false, code: 'INVALID', message: 'homeScore/awayScore required' });
    }

    const { data: match, error: mErr } = await sb
      .from('matches')
      .select('id,home_team_id,away_team_id')
      .eq('id', matchId)
      .single();
    if (mErr || !match) return json({ ok: false, code: 'NOT_FOUND', message: 'match' }, 404);

    // Derive the winner for a decisive score; the operator supplies it for a KO draw.
    const derived =
      homeScore > awayScore ? match.home_team_id : homeScore < awayScore ? match.away_team_id : null;
    const winner = winnerTeamId !== undefined ? winnerTeamId : derived;
    // LIVE pushes a provisional score (trigger keeps prediction_scores empty until FINISHED).
    const nextStatus = status === 'LIVE' ? 'LIVE' : 'FINISHED';

    const { error } = await sb
      .from('matches')
      .update({ status: nextStatus, home_score: homeScore, away_score: awayScore, winner_team_id: winner })
      .eq('id', matchId);
    if (error) return json({ ok: false, code: 'INTERNAL', message: error.message }, 500);
    return json({ ok: true, status: nextStatus, winnerTeamId: winner });
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
