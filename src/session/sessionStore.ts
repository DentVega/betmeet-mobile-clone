/**
 * Zustand store — the single global client-state source for the shell (ADR-002).
 * Drives resolveAppPhase and holds any parked deep-link intent.
 */
import { create } from 'zustand';
import type { Session as SupabaseSession } from '@supabase/supabase-js';
import type { AuthStatus } from '../domain/appPhase';
import type { DeepLinkIntent } from '../domain/deepLink';

interface SessionState {
  authStatus: AuthStatus;
  userId: string | null;
  email: string | null;
  /** null until the profile gate is resolved (Bolt 3 wires the fetch). */
  onboardingCompleted: boolean | null;
  parkedIntent: DeepLinkIntent | null;

  setFromSupabase: (session: SupabaseSession | null) => void;
  setOnboardingCompleted: (value: boolean | null) => void;
  park: (intent: DeepLinkIntent) => void;
  /** Returns and clears the parked intent (replayed exactly once). */
  takeParked: () => DeepLinkIntent | null;
  clear: () => void;
}

function deriveStatus(session: SupabaseSession | null): AuthStatus {
  if (!session?.user) {
    return 'unauthenticated';
  }
  return session.user.email_confirmed_at ? 'authenticated' : 'unverified';
}

export const useSessionStore = create<SessionState>((set, get) => ({
  authStatus: 'unknown',
  userId: null,
  email: null,
  onboardingCompleted: null,
  parkedIntent: null,

  setFromSupabase: (session) =>
    set({
      authStatus: deriveStatus(session),
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      // Drop the resolved gate on sign-out; keep it while a user is present.
      onboardingCompleted: session?.user ? get().onboardingCompleted : null,
    }),

  setOnboardingCompleted: (value) => set({ onboardingCompleted: value }),

  park: (intent) => set({ parkedIntent: intent }),

  takeParked: () => {
    const intent = get().parkedIntent;
    if (intent) {
      set({ parkedIntent: null });
    }
    return intent;
  },

  clear: () =>
    set({
      authStatus: 'unauthenticated',
      userId: null,
      email: null,
      onboardingCompleted: null,
      parkedIntent: null,
    }),
}));
