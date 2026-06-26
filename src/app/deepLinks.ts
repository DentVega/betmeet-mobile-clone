/**
 * Deep-link handling (ADR-004). Parsing + the park/navigate decision are pure
 * (test surface); execution uses the navigation ref. Auth-gated `poolJoin` links
 * are parked in the session store and replayed once phase = App.
 *
 * We handle links manually (rather than React Navigation's declarative linking
 * config) because the navigator tree swaps by auth phase, which the declarative
 * config can't express cleanly.
 */
import { useEffect } from 'react';
import { Linking } from 'react-native';
import {
  parseDeepLink,
  isParkable,
  type DeepLinkIntent,
} from '../domain/deepLink';
import { resolveAppPhase, type AppPhase } from '../domain/appPhase';
import { useSessionStore } from '../session/sessionStore';
import { navigationRef } from './navigationRef';

export type DeepLinkAction =
  | { type: 'park'; intent: DeepLinkIntent }
  | { type: 'navigate'; intent: DeepLinkIntent }
  | { type: 'ignore' };

/** Pure decision — the unit-test surface for routing. */
export function decideDeepLinkAction(
  intent: DeepLinkIntent | null,
  phase: AppPhase,
): DeepLinkAction {
  if (!intent) {
    return { type: 'ignore' };
  }
  if (isParkable(intent) && phase !== 'App') {
    return { type: 'park', intent };
  }
  return { type: 'navigate', intent };
}

function currentPhase(): AppPhase {
  const { authStatus, onboardingCompleted } = useSessionStore.getState();
  return resolveAppPhase({ authStatus, onboardingCompleted });
}

function navigateForIntent(intent: DeepLinkIntent): void {
  if (!navigationRef.isReady()) {
    return;
  }
  // The deep-link targets span multiple stacks (which one is mounted depends on
  // auth phase), so we route through an untyped navigate.
  const navigate = navigationRef.navigate as unknown as (
    name: string,
    params?: object,
  ) => void;

  switch (intent.kind) {
    case 'poolJoin':
      navigate('Pools', {
        screen: 'PoolJoin',
        params: { token: intent.token },
      });
      break;
    case 'authConfirm':
      navigate('VerifyEmail', {
        tokenHash: intent.tokenHash,
        type: intent.type ?? undefined,
      });
      break;
    case 'authReset':
      navigate('ResetPassword', { tokenHash: intent.tokenHash });
      break;
  }
}

export function handleUrl(url: string): void {
  const action = decideDeepLinkAction(parseDeepLink(url), currentPhase());
  if (action.type === 'park') {
    useSessionStore.getState().park(action.intent);
  } else if (action.type === 'navigate') {
    navigateForIntent(action.intent);
  }
}

/** Replays a parked intent (called by RootNavigator when phase becomes App). */
export function replayParkedIntent(): void {
  const intent = useSessionStore.getState().takeParked();
  if (intent) {
    navigateForIntent(intent);
  }
}

/** Subscribes to cold-start + warm deep links. Mounted once at the App root. */
export function useDeepLinkHandler(): void {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);
}
