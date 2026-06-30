// POST delete-pool — auth (JWT); owner-only → fn_delete_pool (cascade). US-P6.
import { userClient } from '../_shared/clients.ts';
import { cors, json, mapPgError } from '../_shared/respond.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { poolId } = (await req.json().catch(() => ({}))) as { poolId?: string };
    if (!poolId) return json({ ok: false, code: 'INVALID', message: 'poolId required' });
    const { data, error } = await userClient(req).rpc('fn_delete_pool', { p_pool: poolId });
    if (error) return json({ ok: false, ...mapPgError(error) });
    return json(data);
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
