/**
 * Pure deep-link parser for the `betmeet://` scheme.
 * Mirrors intents/001-mobile-v1-migration/system-context.md §4.
 * Relies on URLSearchParams (provided by react-native-url-polyfill).
 */

export type DeepLinkIntent =
  | { kind: 'authConfirm'; tokenHash: string; type: string | null }
  | { kind: 'authReset'; tokenHash: string }
  | { kind: 'authCallback'; code: string }
  | { kind: 'poolJoin'; token: string };

export const DEEP_LINK_SCHEME = 'betmeet://';

export function parseDeepLink(url: string): DeepLinkIntent | null {
  if (!url || !url.startsWith(DEEP_LINK_SCHEME)) {
    return null;
  }

  const rest = url.slice(DEEP_LINK_SCHEME.length);
  const [pathPart = '', queryPart = ''] = rest.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart);

  if (segments[0] === 'auth' && segments[1] === 'confirm') {
    const tokenHash = params.get('token_hash');
    if (!tokenHash) {
      return null;
    }
    return { kind: 'authConfirm', tokenHash, type: params.get('type') };
  }

  if (segments[0] === 'auth' && segments[1] === 'reset') {
    const tokenHash = params.get('token_hash');
    if (!tokenHash) {
      return null;
    }
    return { kind: 'authReset', tokenHash };
  }

  if (segments[0] === 'auth' && segments[1] === 'callback') {
    const code = params.get('code');
    if (!code) {
      return null;
    }
    return { kind: 'authCallback', code };
  }

  if (segments[0] === 'pools' && segments[1] === 'join' && segments[2]) {
    return { kind: 'poolJoin', token: decodeURIComponent(segments[2]) };
  }

  return null;
}

/** Intents that must survive an auth/onboarding detour before they can run. */
export function isParkable(intent: DeepLinkIntent): boolean {
  return intent.kind === 'poolJoin';
}
