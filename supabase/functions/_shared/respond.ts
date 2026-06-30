// Shared HTTP helpers + Postgres-error → stable-code mapping for the write API.

export const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

const KNOWN_CODES = [
  'UNAUTHENTICATED',
  'NOT_ONBOARDED',
  'NOT_MEMBER',
  'LOCKED',
  'INVALID',
  'NOT_FOUND',
  'FULL',
  'NAME_TAKEN',
  'NICKNAME_TAKEN',
];

export interface MappedError {
  code: string;
  message: string;
}

/** Translate a supabase/Postgres error into a stable { code }. */
export function mapPgError(error: { message?: string; code?: string } | null): MappedError {
  const msg = error?.message ?? '';
  if (error?.code === '23505') {
    if (msg.includes('invite_token')) return { code: 'TOKEN_TAKEN', message: 'token collision' };
    if (msg.includes('public_name')) return { code: 'NAME_TAKEN', message: 'name taken' };
    return { code: 'CONFLICT', message: msg };
  }
  for (const k of KNOWN_CODES) {
    if (msg.includes(k)) return { code: k, message: k };
  }
  return { code: 'INTERNAL', message: msg || 'internal error' };
}
