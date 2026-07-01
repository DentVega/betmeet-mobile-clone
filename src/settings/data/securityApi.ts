/** Security operations over supabase.auth (MFA, identities) + delete-account fn. */
import { supabase } from '../../session/supabaseClient';

export interface TotpFactor {
  id: string;
  status: string;
}

export async function listFactors(): Promise<TotpFactor[]> {
  const { data } = await supabase.auth.mfa.listFactors();
  return (data?.totp ?? []) as TotpFactor[];
}

export async function enrollTotp(): Promise<{ factorId: string; secret: string; uri: string } | null> {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
  if (error || !data) return null;
  return { factorId: data.id, secret: data.totp.secret, uri: data.totp.uri };
}

export async function verifyTotp(factorId: string, code: string): Promise<{ ok: boolean }> {
  const ch = await supabase.auth.mfa.challenge({ factorId });
  if (ch.error || !ch.data) return { ok: false };
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.data.id, code });
  return { ok: !error };
}

export async function disableMfa(factorId: string): Promise<{ ok: boolean }> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return { ok: !error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listIdentities(): Promise<any[]> {
  const { data } = await supabase.auth.getUserIdentities();
  return data?.identities ?? [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function unlinkIdentity(identity: any): Promise<{ ok: boolean }> {
  const { error } = await supabase.auth.unlinkIdentity(identity);
  return { ok: !error };
}

export async function deleteAccount(): Promise<{ ok: boolean }> {
  const { data, error } = await supabase.functions.invoke('delete-account');
  if (error) return { ok: false };
  return (data as { ok: boolean }) ?? { ok: false };
}
