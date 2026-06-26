/**
 * Maps raw Supabase errors to a stable domain AuthError with an i18n message-key.
 * The ONLY place that inspects raw provider strings — screens render localized,
 * stable messages via this (model invariant).
 */
export type AuthErrorKind =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'emailAlreadyInUse'
  | 'weakPassword'
  | 'rateLimited'
  | 'network'
  | 'unknown';

export interface AuthError {
  kind: AuthErrorKind;
  messageKey: string;
}

export function mapAuthError(raw: unknown): AuthError {
  const e = raw as { message?: string; status?: number; code?: string } | null;
  const msg = (e?.message ?? '').toLowerCase();
  const code = (e?.code ?? '').toLowerCase();
  const status = e?.status;

  if (
    msg.includes('failed to fetch') ||
    msg.includes('network request failed') ||
    code === 'network_error'
  ) {
    return { kind: 'network', messageKey: 'auth.errors.network' };
  }
  if (code === 'invalid_credentials' || msg.includes('invalid login')) {
    return {
      kind: 'invalidCredentials',
      messageKey: 'auth.errors.invalidCredentials',
    };
  }
  if (code === 'email_not_confirmed' || msg.includes('not confirmed')) {
    return {
      kind: 'emailNotConfirmed',
      messageKey: 'auth.errors.emailNotConfirmed',
    };
  }
  if (
    code === 'user_already_exists' ||
    msg.includes('already registered') ||
    msg.includes('already in use')
  ) {
    return {
      kind: 'emailAlreadyInUse',
      messageKey: 'auth.errors.emailAlreadyInUse',
    };
  }
  if (
    code === 'weak_password' ||
    msg.includes('weak password') ||
    msg.includes('password should be')
  ) {
    return { kind: 'weakPassword', messageKey: 'auth.errors.weakPassword' };
  }
  if (
    status === 429 ||
    code === 'over_request_rate_limit' ||
    msg.includes('rate limit')
  ) {
    return { kind: 'rateLimited', messageKey: 'auth.errors.rateLimited' };
  }
  return { kind: 'unknown', messageKey: 'auth.errors.unknown' };
}
