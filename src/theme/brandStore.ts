/** Selected brand theme (deportivo|moderno|premium), persisted in secure storage. */
import { create } from 'zustand';
import { secureStorage } from '../session/secureStorage';
import { BRANDS, type Brand } from './tokens';

const KEY = 'betmeet.brand';

interface BrandState {
  brand: Brand;
  setBrand: (b: Brand) => void;
  hydrate: () => Promise<void>;
}

export const useBrandStore = create<BrandState>((set) => ({
  brand: 'deportivo',
  setBrand: (brand) => {
    set({ brand });
    void secureStorage.setItem(KEY, brand);
  },
  hydrate: async () => {
    const v = await secureStorage.getItem(KEY);
    if (v && (BRANDS as string[]).includes(v)) {
      set({ brand: v as Brand });
    }
  },
}));
