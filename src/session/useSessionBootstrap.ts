/**
 * Boots the session: hydrates from secure storage, subscribes to Supabase auth
 * changes, and wires foreground auto-refresh. Mounted once at the App root.
 */
import { useEffect } from 'react';
import { supabase, registerAuthRefresh } from './supabaseClient';
import { useSessionStore } from './sessionStore';
import { fetchOnboardingCompleted } from '../auth/profileGate';

/** Resolve the profile gate for a verified user; safe no-op otherwise. */
async function resolveGate(userId: string | null, verified: boolean) {
  const { setOnboardingCompleted } = useSessionStore.getState();
  if (!userId || !verified) {
    return;
  }
  const completed = await fetchOnboardingCompleted(userId);
  setOnboardingCompleted(completed);
}

export function useSessionBootstrap(): void {
  useEffect(() => {
    const { setFromSupabase } = useSessionStore.getState();
    let active = true;

    // Initial hydrate: resolves authStatus from 'unknown'.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      setFromSupabase(data.session);
      const user = data.session?.user;
      void resolveGate(user?.id ?? null, Boolean(user?.email_confirmed_at));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setFromSupabase(session);
      // Resolve the onboarding gate once the user is authenticated + verified
      // (closes the Bolt 0 TODO → moves the shell out of Booting).
      void resolveGate(
        session?.user?.id ?? null,
        Boolean(session?.user?.email_confirmed_at),
      );
    });

    const unregisterRefresh = registerAuthRefresh();

    return () => {
      active = false;
      subscription.unsubscribe();
      unregisterRefresh();
    };
  }, []);
}
