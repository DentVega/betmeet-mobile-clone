/**
 * Google OAuth via the system browser (ADR-006). No native dependency: get the
 * provider URL with skipBrowserRedirect, open it with Linking, and complete the
 * session when the betmeet://auth/callback deep link returns (exchangeOAuthCode).
 */
import { Linking } from 'react-native';
import { supabase } from '../session/supabaseClient';
import { mapAuthError } from './authErrors';
import type { AuthResult } from './authService';

export async function signInWithGoogle(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'betmeet://auth/callback',
      skipBrowserRedirect: true,
    },
  });
  if (error) {
    return { ok: false, error: mapAuthError(error) };
  }
  if (!data?.url) {
    return { ok: false, error: mapAuthError(new Error('missing oauth url')) };
  }
  await Linking.openURL(data.url);
  // The session is established asynchronously by exchangeOAuthCode() once the
  // auth/callback deep link returns; the nav state machine advances then.
  return { ok: true };
}

export async function exchangeOAuthCode(code: string): Promise<AuthResult> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error ? { ok: false, error: mapAuthError(error) } : { ok: true };
}

/** Link a Google identity to the current account (FR-AS6) — same browser flow. */
export async function linkGoogle(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: { redirectTo: 'betmeet://auth/callback', skipBrowserRedirect: true },
  });
  if (error) return { ok: false, error: mapAuthError(error) };
  if (!data?.url) return { ok: false, error: mapAuthError(new Error('missing oauth url')) };
  await Linking.openURL(data.url);
  return { ok: true };
}
