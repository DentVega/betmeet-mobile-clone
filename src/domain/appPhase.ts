/**
 * Pure navigation state machine. No I/O — the unit-test surface for the shell.
 * Mirrors intents/001-mobile-v1-migration/system-context.md §3.
 */

export type AuthStatus =
  | 'unknown'
  | 'unauthenticated'
  | 'unverified'
  | 'authenticated';

export type AppPhase = 'Booting' | 'Auth' | 'Onboarding' | 'App';

export interface AppPhaseInput {
  authStatus: AuthStatus;
  /** null = not yet known (profile still loading). */
  onboardingCompleted: boolean | null;
}

export function resolveAppPhase({
  authStatus,
  onboardingCompleted,
}: AppPhaseInput): AppPhase {
  switch (authStatus) {
    case 'unknown':
      return 'Booting';
    case 'unauthenticated':
    case 'unverified':
      // The verify-email gate lives inside the Auth stack.
      return 'Auth';
    case 'authenticated':
      if (onboardingCompleted === null) {
        return 'Booting'; // still resolving the profile gate
      }
      return onboardingCompleted ? 'App' : 'Onboarding';
  }
}
