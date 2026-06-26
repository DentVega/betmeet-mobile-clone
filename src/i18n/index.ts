/**
 * Minimal i18n for the shell (NFR-7). Default locale `es`; switchable at runtime.
 * Device-locale detection and persistence are added with Settings (deferred to v2).
 */
import { es, type Dictionary } from './dictionaries/es';
import { en } from './dictionaries/en';

export type Locale = 'es' | 'en';
export const DEFAULT_LOCALE: Locale = 'es';

const dictionaries: Record<Locale, Dictionary> = { es, en };

let currentLocale: Locale = DEFAULT_LOCALE;

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/** Current dictionary. */
export function t(): Dictionary {
  return dictionaries[currentLocale];
}

/**
 * Resolve a dotted message-key (e.g. 'auth.errors.emailInvalid') against the
 * current dictionary. Returns the key itself if missing (safe fallback).
 */
export function tr(path: string): string {
  let node: unknown = dictionaries[currentLocale];
  for (const part of path.split('.')) {
    if (node && typeof node === 'object' && part in (node as object)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof node === 'string' ? node : path;
}
