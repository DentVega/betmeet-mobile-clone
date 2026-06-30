// POST kick-member — auth (JWT); owner-only → fn_kick_member. US-P6.
import { userClient } from '../_shared/clients.ts';
import { cors, json, mapPgError } from '../_shared/respond.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { poolId, userId } = (await req.json().catch(() => ({}))) as {
      poolId?: string;
      userId?: string;
    };
    if (!poolId || !userId) return json({ ok: false, code: 'INVALID', message: 'poolId + userId required' });
    const { data, error } = await userClient(req).rpc('fn_kick_member', {
      p_pool: poolId,
      p_user: userId,
    });
    if (error) return json({ ok: false, ...mapPgError(error) });
    return json(data);
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
