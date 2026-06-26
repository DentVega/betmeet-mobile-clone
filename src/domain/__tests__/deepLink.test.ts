import 'react-native-url-polyfill/auto';
import { parseDeepLink, isParkable } from '../deepLink';

describe('parseDeepLink', () => {
  it('returns null for non-betmeet urls', () => {
    expect(parseDeepLink('https://example.com')).toBeNull();
    expect(parseDeepLink('')).toBeNull();
  });

  it('parses auth/confirm with token_hash and type', () => {
    expect(
      parseDeepLink('betmeet://auth/confirm?token_hash=abc123&type=email'),
    ).toEqual({ kind: 'authConfirm', tokenHash: 'abc123', type: 'email' });
  });

  it('returns null for auth/confirm without a token_hash', () => {
    expect(parseDeepLink('betmeet://auth/confirm?type=email')).toBeNull();
  });

  it('parses auth/reset', () => {
    expect(parseDeepLink('betmeet://auth/reset?token_hash=xyz')).toEqual({
      kind: 'authReset',
      tokenHash: 'xyz',
    });
  });

  it('parses pools/join with a token and decodes it', () => {
    expect(parseDeepLink('betmeet://pools/join/ABC123')).toEqual({
      kind: 'poolJoin',
      token: 'ABC123',
    });
  });

  it('returns null for unknown betmeet paths', () => {
    expect(parseDeepLink('betmeet://something/else')).toBeNull();
  });

  it('marks only poolJoin as parkable', () => {
    expect(isParkable({ kind: 'poolJoin', token: 'X' })).toBe(true);
    expect(isParkable({ kind: 'authReset', tokenHash: 'X' })).toBe(false);
  });
});
