import type { Dictionary } from './es';

/** English dictionary — must mirror the shape of es.ts (typed against Dictionary). */
export const en: Dictionary = {
  common: { loading: 'Loading…', retry: 'Retry', back: 'Back' },
  shell: { signOut: 'Sign out' },
  tabs: { matches: 'Matches', pools: 'Pools', rankings: 'Rankings' },
  placeholder: { comingSoon: 'Coming soon' },
};
