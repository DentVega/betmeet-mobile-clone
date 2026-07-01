/** Reactive locale (es|en), persisted in secure storage; mirrors into the i18n module. */
import { create } from 'zustand';
import { secureStorage } from '../session/secureStorage';
import { supabase } from '../session/supabaseClient';
import { useSessionStore } from '../session/sessionStore';
import { setLocale as i18nSetLocale, DEFAULT_LOCALE, type Locale } from './index';

const KEY = 'betmeet.locale';

function persistDevice(locale: Locale) {
  i18nSetLocale(locale);
  void secureStorage.setItem(KEY, locale);
}

function deviceDefault(): Locale {
  try {
    const l = Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    return l.toLowerCase().startsWith('en') ? 'en' : 'es';
  } catch {
    return DEFAULT_LOCALE;
  }
}

interface LocaleState {
  locale: Locale;
  /** User-initiated change: persist to device + (if authed) sync to profiles.locale. */
  setLocale: (l: Locale) => void;
  /** Server-driven (login): apply device-side only, no write-back. */
  applyLocale: (l: Locale) => void;
  hydrate: () => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => {
    persistDevice(locale);
    set({ locale });
    const uid = useSessionStore.getState().userId;
    if (uid) {
      void supabase.from('profiles').update({ locale }).eq('id', uid);
    }
  },
  applyLocale: (locale) => {
    persistDevice(locale);
    set({ locale });
  },
  hydrate: async () => {
    const v = await secureStorage.getItem(KEY);
    const locale: Locale = v === 'es' || v === 'en' ? v : deviceDefault();
    persistDevice(locale);
    set({ locale });
  },
}));
