import { resolveAppPhase } from '../appPhase';

describe('resolveAppPhase', () => {
  it('boots while auth status is unknown', () => {
    expect(
      resolveAppPhase({ authStatus: 'unknown', onboardingCompleted: null }),
    ).toBe('Booting');
  });

  it('routes unauthenticated and unverified users to Auth', () => {
    expect(
      resolveAppPhase({ authStatus: 'unauthenticated', onboardingCompleted: null }),
    ).toBe('Auth');
    expect(
      resolveAppPhase({ authStatus: 'unverified', onboardingCompleted: null }),
    ).toBe('Auth');
  });

  it('boots an authenticated user until the profile gate resolves', () => {
    expect(
      resolveAppPhase({ authStatus: 'authenticated', onboardingCompleted: null }),
    ).toBe('Booting');
  });

  it('sends an authenticated, not-onboarded user to Onboarding', () => {
    expect(
      resolveAppPhase({ authStatus: 'authenticated', onboardingCompleted: false }),
    ).toBe('Onboarding');
  });

  it('sends an authenticated, onboarded user to App', () => {
    expect(
      resolveAppPhase({ authStatus: 'authenticated', onboardingCompleted: true }),
    ).toBe('App');
  });
});
