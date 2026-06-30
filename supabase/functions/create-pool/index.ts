// POST create-pool — auth (JWT); generate invite token (retry on collision) →
// fn_create_pool (atomic pool + owner membership). FR-BK4 / US-P2.
import { userClient } from '../_shared/clients.ts';
import { cors, json, mapPgError } from '../_shared/respond.ts';
import { genToken } from '../_shared/inviteToken.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const type = body?.type;
    const capacity = Number(body?.capacity);
    const membersCanInvite = body?.membersCanInvite ?? true;

    if (name.length < 3 || name.length > 60) return json({ ok: false, code: 'INVALID', message: 'name 3-60' });
    if (type !== 'PUBLIC' && type !== 'PRIVATE') return json({ ok: false, code: 'INVALID', message: 'type' });
    if (!Number.isInteger(capacity) || capacity < 2 || capacity > 100) {
      return json({ ok: false, code: 'INVALID', message: 'capacity 2-100' });
    }

    const sb = userClient(req);
    // up to 5 attempts at length 8, then one fallback at length 12.
    for (let attempt = 0; attempt < 6; attempt++) {
      const token = genToken(attempt < 5 ? 8 : 12);
      const { data, error } = await sb.rpc('fn_create_pool', {
        p_name: name,
        p_type: type,
        p_capacity: capacity,
        p_members_can_invite: membersCanInvite,
        p_token: token,
      });
      if (!error) return json({ ok: true, poolId: data });
      const mapped = mapPgError(error);
      if (mapped.code === 'TOKEN_TAKEN') continue; // regenerate + retry
      return json({ ok: false, ...mapped });
    }
    return json({ ok: false, code: 'INTERNAL', message: 'could not allocate invite token' }, 500);
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
