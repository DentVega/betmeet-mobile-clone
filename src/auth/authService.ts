/**
 * AuthService — the effectful contract over supabase.auth (Bolt 1 model).
 * Screens depend on this (+ pure validators), never on `supabase` directly, so
 * they stay testable. Session persistence/refresh stay owned by Bolt 0.
 */
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '../session/supabaseClient';
import { mapAuthError, type AuthError } from './authErrors';

export type AuthResult = { ok: true } | { ok: false; error: AuthError };

const OK: AuthResult = { ok: true };
const fail = (e: unknown): AuthResult => ({ ok: false, error: mapAuthError(e) });

export const authService = {
  async signUp(email: string, password: string): Promise<AuthResult> {
    // No session is created until the email is confirmed (FR-A1, FR-A7).
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? fail(error) : OK;
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? fail(error) : OK;
  },

  async requestPasswordReset(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'betmeet://auth/reset',
    });
    return error ? fail(error) : OK;
  },

  async confirmEmail(tokenHash: string, type: string): Promise<AuthResult> {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (type || 'email') as EmailOtpType,
    });
    return error ? fail(error) : OK;
  },

  async resendConfirmation(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return error ? fail(error) : OK;
  },

  async beginPasswordRecovery(tokenHash: string): Promise<AuthResult> {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    });
    return error ? fail(error) : OK;
  },

  async completePasswordReset(newPassword: string): Promise<AuthResult> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error ? fail(error) : OK;
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },
};
