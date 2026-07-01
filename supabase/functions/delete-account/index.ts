// POST delete-account — hard-delete the caller (FR-AS3). verify_jwt = true.
// Transfers owned pools (to the oldest other active member, else deletes), soft-deletes
// the profile, then admin.deleteUser. Uses the service role for the privileged steps.
import { userClient, adminClient } from '../_shared/clients.ts';
import { cors, json } from '../_shared/respond.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { data: userData, error: uErr } = await userClient(req).auth.getUser();
    const uid = userData.user?.id;
    if (uErr || !uid) return json({ ok: false, code: 'UNAUTHENTICATED' }, 401);

    const sb = adminClient();

    // Owned pools: transfer to the oldest other active member, else delete.
    const { data: owned } = await sb.from('pools').select('id').eq('owner_id', uid);
    for (const p of owned ?? []) {
      const { data: other } = await sb
        .from('pool_memberships')
        .select('user_id')
        .eq('pool_id', p.id)
        .is('archived_at', null)
        .neq('user_id', uid)
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (other?.user_id) {
        await sb.from('pools').update({ owner_id: other.user_id }).eq('id', p.id);
      } else {
        await sb.from('pools').delete().eq('id', p.id);
      }
    }

    // Soft-delete the profile, then purge the auth user.
    await sb.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', uid);
    const { error: dErr } = await sb.auth.admin.deleteUser(uid);
    if (dErr) return json({ ok: false, code: 'INTERNAL', message: dErr.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
