/**
 * Passkeys (FR-AS5) — bridge react-native-passkey ↔ Supabase MFA WebAuthn.
 *
 * ⚠️ UNVERIFIED / activation-pending. Gated on ENV.PASSKEY_RP_ID + Passkey.isSupported().
 * Supabase's WebAuthn is DOM-first: `mfa.challenge` returns options deserialized to
 * ArrayBuffers, while react-native-passkey wants base64url JSON — we re-serialize the
 * binary fields here. This cannot be tested end-to-end without the RP domain +
 * assetlinks.json + Supabase WebAuthn config (see bolt design/outcome). Treat as
 * best-effort scaffolding to finish once that infra exists.
 */
import { Passkey } from 'react-native-passkey';
import { encode as b64encode } from 'base64-arraybuffer';
import { supabase } from '../session/supabaseClient';
import { ENV } from '../config/env';

export type PasskeyResult = { ok: true } | { ok: false; code: string };

const RP_ID = ENV.PASSKEY_RP_ID;
const RP_ORIGINS = RP_ID ? [`https://${RP_ID}`] : [];

/** Passkeys usable only when an RP is configured and the device supports them. */
export function passkeysAvailable(): boolean {
  try {
    return !!RP_ID && Passkey.isSupported();
  } catch {
    return false;
  }
}

const toB64url = (buf: ArrayBuffer): string =>
  b64encode(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBuffer = (v: any): v is ArrayBuffer => v instanceof ArrayBuffer || ArrayBuffer.isView?.(v);

/** Re-serialize Supabase's deserialized (ArrayBuffer) WebAuthn options back to JSON. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function optionsToJSON(pk: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enc = (v: any) => (isBuffer(v) ? toB64url(v as ArrayBuffer) : v);
  return {
    ...pk,
    challenge: enc(pk.challenge),
    user: pk.user ? { ...pk.user, id: enc(pk.user.id) } : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    excludeCredentials: pk.excludeCredentials?.map((c: any) => ({ ...c, id: enc(c.id) })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allowCredentials: pk.allowCredentials?.map((c: any) => ({ ...c, id: enc(c.id) })),
  };
}

/** Register a passkey for the current user (biometric prompt). */
export async function registerPasskey(): Promise<PasskeyResult> {
  if (!RP_ID) return { ok: false, code: 'NOT_CONFIGURED' };
  if (!Passkey.isSupported()) return { ok: false, code: 'UNSUPPORTED' };
  const enroll = await supabase.auth.mfa.enroll({ factorType: 'webauthn' });
  if (enroll.error || !enroll.data) return { ok: false, code: 'INTERNAL' };
  const ch = await supabase.auth.mfa.challenge({
    factorId: enroll.data.id,
    webauthn: { rpId: RP_ID, rpOrigins: RP_ORIGINS },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chData = ch.data as any;
  if (ch.error || !chData?.webauthn) return { ok: false, code: 'INTERNAL' };
  try {
    const options = optionsToJSON(chData.webauthn.credential_options.publicKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const credential = await Passkey.create(options as any);
    const verify = await supabase.auth.mfa.verify({
      factorId: enroll.data.id,
      challengeId: chData.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webauthn: { rpId: RP_ID, rpOrigins: RP_ORIGINS, type: 'create', credential_response: credential as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    return verify.error ? { ok: false, code: 'INTERNAL' } : { ok: true };
  } catch {
    return { ok: false, code: 'CANCELLED' };
  }
}
