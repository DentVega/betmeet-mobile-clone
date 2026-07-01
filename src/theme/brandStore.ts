/** Selected brand theme + color-scheme override, persisted in secure storage. */
import { create } from 'zustand';
import { secureStorage } from '../session/secureStorage';
import { BRANDS, type Brand } from './tokens';

const BRAND_KEY = 'betmeet.brand';
const SCHEME_KEY = 'betmeet.scheme';

export type SchemePref = 'system' | 'light' | 'dark';
export const SCHEMES: SchemePref[] = ['system', 'light', 'dark'];

interface BrandState {
  brand: Brand;
  scheme: SchemePref;
  setBrand: (b: Brand) => void;
  setScheme: (s: SchemePref) => void;
  hydrate: () => Promise<void>;
}

export const useBrandStore = create<BrandState>((set) => ({
  brand: 'deportivo',
  scheme: 'system',
  setBrand: (brand) => {
    set({ brand });
    void secureStorage.setItem(BRAND_KEY, brand);
  },
  setScheme: (scheme) => {
    set({ scheme });
    void secureStorage.setItem(SCHEME_KEY, scheme);
  },
  hydrate: async () => {
    const b = await secureStorage.getItem(BRAND_KEY);
    if (b && (BRANDS as string[]).includes(b)) {
      set({ brand: b as Brand });
    }
    const s = await secureStorage.getItem(SCHEME_KEY);
    if (s && (SCHEMES as string[]).includes(s)) {
      set({ scheme: s as SchemePref });
    }
  },
}));
