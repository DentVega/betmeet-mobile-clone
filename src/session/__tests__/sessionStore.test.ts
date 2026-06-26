import { useSessionStore } from '../sessionStore';

const initial = useSessionStore.getState();

function reset() {
  useSessionStore.setState({
    authStatus: 'unknown',
    userId: null,
    email: null,
    onboardingCompleted: null,
    parkedIntent: null,
  });
}

beforeEach(reset);

describe('sessionStore', () => {
  it('derives unauthenticated from a null session', () => {
    initial.setFromSupabase(null);
    expect(useSessionStore.getState().authStatus).toBe('unauthenticated');
  });

  it('derives unverified when email is not confirmed', () => {
    initial.setFromSupabase({
      user: { id: 'u1', email: 'a@b.com', email_confirmed_at: null },
    } as never);
    expect(useSessionStore.getState().authStatus).toBe('unverified');
    expect(useSessionStore.getState().userId).toBe('u1');
  });

  it('derives authenticated when email is confirmed', () => {
    initial.setFromSupabase({
      user: { id: 'u1', email: 'a@b.com', email_confirmed_at: '2026-01-01' },
    } as never);
    expect(useSessionStore.getState().authStatus).toBe('authenticated');
  });

  it('parks and replays an intent exactly once', () => {
    const intent = { kind: 'poolJoin', token: 'ABC' } as const;
    initial.park(intent);
    expect(useSessionStore.getState().parkedIntent).toEqual(intent);
    expect(initial.takeParked()).toEqual(intent);
    expect(initial.takeParked()).toBeNull();
    expect(useSessionStore.getState().parkedIntent).toBeNull();
  });

  it('clears all session state on sign-out', () => {
    initial.setFromSupabase({
      user: { id: 'u1', email: 'a@b.com', email_confirmed_at: '2026-01-01' },
    } as never);
    initial.setOnboardingCompleted(true);
    initial.clear();
    const s = useSessionStore.getState();
    expect(s.authStatus).toBe('unauthenticated');
    expect(s.userId).toBeNull();
    expect(s.onboardingCompleted).toBeNull();
  });
});
