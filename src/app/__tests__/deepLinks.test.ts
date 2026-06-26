// deepLinks transitively imports googleOAuth → the real Supabase client, which
// would touch native keychain on construction. Stub it: this suite only tests
// the pure decideDeepLinkAction.
jest.mock('../../session/supabaseClient', () => ({ supabase: {} }));

import { decideDeepLinkAction } from '../deepLinks';
import type { DeepLinkIntent } from '../../domain/deepLink';

const poolJoin: DeepLinkIntent = { kind: 'poolJoin', token: 'ABC' };
const authReset: DeepLinkIntent = { kind: 'authReset', tokenHash: 'x' };

describe('decideDeepLinkAction', () => {
  it('ignores a null intent', () => {
    expect(decideDeepLinkAction(null, 'App').type).toBe('ignore');
  });

  it('parks a parkable intent when not yet in the App phase', () => {
    expect(decideDeepLinkAction(poolJoin, 'Auth')).toEqual({
      type: 'park',
      intent: poolJoin,
    });
    expect(decideDeepLinkAction(poolJoin, 'Onboarding').type).toBe('park');
  });

  it('navigates a parkable intent once in the App phase', () => {
    expect(decideDeepLinkAction(poolJoin, 'App')).toEqual({
      type: 'navigate',
      intent: poolJoin,
    });
  });

  it('navigates non-parkable intents regardless of phase', () => {
    expect(decideDeepLinkAction(authReset, 'Auth').type).toBe('navigate');
  });

  it('navigates an OAuth callback intent', () => {
    const cb: DeepLinkIntent = { kind: 'authCallback', code: 'abc' };
    expect(decideDeepLinkAction(cb, 'Auth').type).toBe('navigate');
  });
});
