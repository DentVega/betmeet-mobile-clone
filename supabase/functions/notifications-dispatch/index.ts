// POST notifications-dispatch — drain the notification outbox → FCM HTTP v1.
// verify_jwt=false; guarded by x-admin-secret. Invoked by a cron (activation).
// ⚠️ Untestable without real FCM creds (FCM_SERVICE_ACCOUNT secret). Best-effort structure.
import { adminClient } from '../_shared/clients.ts';
import { cors, json } from '../_shared/respond.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

const TITLES: Record<string, string> = {
  match_end: 'Partido finalizado',
  pool_invite: 'Nueva invitación a una liga',
  match_start: 'El partido va a empezar',
  rank_up: 'Subiste en la clasificación',
  goal: '¡Gol!',
};

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Mint a Google OAuth access token from a service-account JSON (RS256 JWT). */
async function fcmAccessToken(sa: Json): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claim = b64url(new TextEncoder().encode(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })));
  const unsigned = `${header}.${claim}`;
  const pem = (sa.private_key as string).replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8', keyBytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const jwt = `${unsigned}.${b64url(sig)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tok = await res.json();
  return tok.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.headers.get('x-admin-secret') !== Deno.env.get('ADMIN_SECRET')) {
    return json({ ok: false, code: 'UNAUTHENTICATED' }, 401);
  }
  const saRaw = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (!saRaw) return json({ ok: false, code: 'NOT_CONFIGURED', message: 'FCM_SERVICE_ACCOUNT unset' });
  const sa: Json = JSON.parse(saRaw);
  const sb = adminClient();

  try {
    const token = await fcmAccessToken(sa);
    const endpoint = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

    const { data: events } = await sb
      .from('notification_events').select('*').is('dispatched_at', null).order('created_at').limit(50);

    let sent = 0;
    for (const ev of events ?? []) {
      const type = ev.type as string;
      const p = ev.payload as Json;
      // resolve recipients
      let recipients: string[] = [];
      if (type === 'pool_invite') {
        recipients = p.inviteeUserId ? [p.inviteeUserId] : [];
      } else if (type === 'match_end') {
        const { data: preds } = await sb.from('predictions').select('user_id').eq('match_id', p.matchId);
        recipients = [...new Set((preds ?? []).map((r: Json) => r.user_id))];
      }

      for (const uid of recipients) {
        const { data: pref } = await sb.from('notification_preferences').select(type).eq('user_id', uid).maybeSingle();
        if (pref && (pref as Json)[type] === false) continue;
        const { data: subs } = await sb.from('push_subscriptions').select('id,token').eq('user_id', uid).eq('active', true);
        for (const s of subs ?? []) {
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: {
                token: s.token,
                notification: { title: TITLES[type] ?? 'Betmeet', body: '' },
                data: { link: String(p.link ?? 'betmeet://') },
              },
            }),
          });
          if (resp.status === 404 || resp.status === 410) {
            await sb.from('push_subscriptions').update({ active: false }).eq('id', s.id);
          } else if (resp.ok) {
            sent++;
          }
          await sb.from('notification_deliveries').insert({ event_id: ev.id, subscription_id: s.id, status: String(resp.status) });
        }
      }
      await sb.from('notification_events').update({ dispatched_at: new Date().toISOString() }).eq('id', ev.id);
    }
    return json({ ok: true, dispatched: (events ?? []).length, sent });
  } catch (e) {
    return json({ ok: false, code: 'INTERNAL', message: String(e) }, 500);
  }
});
