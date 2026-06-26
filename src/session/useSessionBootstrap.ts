/**
 * Boots the session: hydrates from secure storage, subscribes to Supabase auth
 * changes, and wires foreground auto-refresh. Mounted once at the App root.
 */
import { useEffect } from 'react';
import { supabase, registerAuthRefresh } from './supabaseClient';
import { useSessionStore } from './sessionStore';

export function useSessionBootstrap(): void {
  useEffect(() => {
    const { setFromSupabase } = useSessionStore.getState();
    let active = true;

    // Initial hydrate: resolves authStatus from 'unknown'.
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setFromSupabase(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setFromSupabase(session);
      // TODO(Bolt 3): when authenticated, fetch profile.onboardingCompleted
      // and call setOnboardingCompleted(...) so the gate can resolve.
    });

    const unregisterRefresh = registerAuthRefresh();

    return () => {
      active = false;
      subscription.unsubscribe();
      unregisterRefresh();
    };
  }, []);
}
