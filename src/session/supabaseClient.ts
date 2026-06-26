/**
 * Supabase client for the existing (frozen) backend. Session persists in secure
 * storage (ADR-003); auto-refresh runs only while the app is foregrounded
 * (Supabase React Native guidance).
 */
import 'react-native-url-polyfill/auto';
import { AppState, type AppStateStatus } from 'react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';
import { ENV } from '../config/env';

export const supabase: SupabaseClient = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Mobile uses deep links + verifyOtp, not URL-fragment session detection.
      detectSessionInUrl: false,
      // PKCE for mobile OAuth + recovery deep links (ADR-006).
      flowType: 'pkce',
    },
  },
);

let appStateSub: { remove: () => void } | null = null;

/** Wire foreground/background auto-refresh. Returns an unsubscribe fn. */
export function registerAuthRefresh(): () => void {
  if (appStateSub) {
    return () => {};
  }
  const onChange = (state: AppStateStatus) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  };
  appStateSub = AppState.addEventListener('change', onChange);
  if (AppState.currentState === 'active') {
    supabase.auth.startAutoRefresh();
  }
  return () => {
    appStateSub?.remove();
    appStateSub = null;
    supabase.auth.stopAutoRefresh();
  };
}
