/** Reactive locale (es|en), persisted in secure storage; mirrors into the i18n module. */
import { create } from 'zustand';
import { secureStorage } from '../session/secureStorage';
import { setLocale as i18nSetLocale, DEFAULT_LOCALE, type Locale } from './index';

const KEY = 'betmeet.locale';

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
  setLocale: (l: Locale) => void;
  hydrate: () => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => {
    i18nSetLocale(locale);
    set({ locale });
    void secureStorage.setItem(KEY, locale);
  },
  hydrate: async () => {
    const v = await secureStorage.getItem(KEY);
    const locale: Locale = v === 'es' || v === 'en' ? v : deviceDefault();
    i18nSetLocale(locale);
    set({ locale });
  },
}));
