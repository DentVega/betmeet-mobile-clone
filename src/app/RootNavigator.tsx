/**
 * Switches the rendered stack from the session store via resolveAppPhase.
 * Phase transitions are declarative — the invariant "never reach App without a
 * verified, onboarded session" is structural, not enforced by imperative calls.
 */
import React, { useEffect } from 'react';
import { useSessionStore } from '../session/sessionStore';
import { resolveAppPhase } from '../domain/appPhase';
import { AuthStack } from './navigation/AuthStack';
import { OnboardingStack } from './navigation/OnboardingStack';
import { AppTabs } from './navigation/AppTabs';
import { BootingScreen } from '../ui/Screen';
import { replayParkedIntent } from './deepLinks';

export function RootNavigator() {
  const authStatus = useSessionStore((s) => s.authStatus);
  const onboardingCompleted = useSessionStore((s) => s.onboardingCompleted);
  const phase = resolveAppPhase({ authStatus, onboardingCompleted });

  useEffect(() => {
    if (phase === 'App') {
      replayParkedIntent();
    }
  }, [phase]);

  switch (phase) {
    case 'Booting':
      return <BootingScreen />;
    case 'Auth':
      return <AuthStack />;
    case 'Onboarding':
      return <OnboardingStack />;
    case 'App':
      return <AppTabs />;
  }
}
