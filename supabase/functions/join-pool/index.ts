// POST join-pool — auth (JWT). Body { poolId } (public) or { token } (by invite).
// → fn_join_pool / fn_join_pool_by_token (capacity + idempotent). FR-BK4 / US-P3/P4.
import { userClient } from '../_shared/clients.ts';
import { cors, json, mapPgError } from '../_shared/respond.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json().catch(() => null);
    const sb = userClient(req);

    if (typeof body?.token === 'string' && body.token.trim().length >= 6) {
      const { data, error } = await sb.rpc('fn_join_pool_by_token', { p_token: body.token.trim() });
      if (error) return json({ ok: false, ...mapPgError(error) });
      return json(data);
    }
    if (typeof body?.poolId === 'string') {
      const { data, error } = await sb.rpc('fn_join_pool', { p_pool: body.poolId });
      if (error) return json({ ok: false, ...mapPgError(error) });
      return json(data);
    }
    return json({ ok: false, code: 'INVALID', message: 'poolId or token required' });
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
