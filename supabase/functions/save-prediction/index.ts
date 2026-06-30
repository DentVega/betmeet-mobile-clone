// POST save-prediction — auth (JWT) → fn_save_prediction (atomic, eligibility,
// lock, dual upsert). FR-BK3 / US-M3.
import { userClient } from '../_shared/clients.ts';
import { cors, json, mapPgError } from '../_shared/respond.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.matchId !== 'string') {
      return json({ ok: false, code: 'INVALID', message: 'matchId required' });
    }
    const home = Number(body.homeScore);
    const away = Number(body.awayScore);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || home > 20 || away < 0 || away > 20) {
      return json({ ok: false, code: 'INVALID', message: 'scores 0-20' });
    }

    const sb = userClient(req);
    const { data, error } = await sb.rpc('fn_save_prediction', {
      p_match: body.matchId,
      p_home: home,
      p_away: away,
      p_pen: body.penaltyWinnerTeamId ?? null,
      p_pool: body.poolId ?? null,
      p_also_global: Boolean(body.alsoSaveAsGlobal),
    });
    if (error) return json({ ok: false, ...mapPgError(error) });
    return json(data ?? { ok: true });
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
