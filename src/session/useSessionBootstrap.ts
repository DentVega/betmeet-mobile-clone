/**
 * Boots the session: hydrates from secure storage, subscribes to Supabase auth
 * changes, and wires foreground auto-refresh. Mounted once at the App root.
 */
import { useEffect } from 'react';
import { supabase, registerAuthRefresh } from './supabaseClient';
import { useSessionStore } from './sessionStore';
import { fetchOnboardingCompleted } from '../auth/profileGate';
import { useLocaleStore } from '../i18n/localeStore';

/** Resolve the profile gate + apply the saved locale for a verified user. */
async function resolveGate(userId: string | null, verified: boolean) {
  const { setOnboardingCompleted } = useSessionStore.getState();
  if (!userId || !verified) {
    return;
  }
  const completed = await fetchOnboardingCompleted(userId);
  setOnboardingCompleted(completed);
  // Apply the profile's saved language (server-driven, no write-back).
  const { data } = await supabase.from('profiles').select('locale').eq('id', userId).maybeSingle();
  const loc = (data as { locale?: string } | null)?.locale;
  if (loc === 'es' || loc === 'en') {
    useLocaleStore.getState().applyLocale(loc);
  }
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
