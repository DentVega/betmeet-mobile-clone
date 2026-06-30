// POST set-nickname — auth (JWT) → fn_set_nickname (atomic discriminator). Bolt 6 / US-O2.
import { userClient } from '../_shared/clients.ts';
import { cors, json, mapPgError } from '../_shared/respond.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json().catch(() => null);
    const base = typeof body?.base === 'string' ? body.base.trim() : '';
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(base)) {
      return json({ ok: false, code: 'INVALID', message: 'nickname 3-20 [A-Za-z0-9_-]' });
    }
    const sb = userClient(req);
    const { data, error } = await sb.rpc('fn_set_nickname', { p_base: base });
    if (error) {
      const m = mapPgError(error);
      // surface the dedicated NICKNAME_TAKEN code
      if (error.message?.includes('NICKNAME_TAKEN')) return json({ ok: false, code: 'NICKNAME_TAKEN', message: 'taken' });
      return json({ ok: false, ...m });
    }
    return json(data ?? { ok: true });
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
