/**
 * Reactive display timezone, persisted in secure storage.
 * `null` = follow the device timezone (the default); a non-null IANA string is a
 * user override chosen in Settings so match dates/times honour the picked zone
 * even when the device/emulator clock is set to the wrong region.
 * Mirrors the localeStore/brandStore pattern (zustand + secureStorage + hydrate).
 */
import { create } from 'zustand';
import { secureStorage } from '../session/secureStorage';

const KEY = 'betmeet.timezone';

/** Curated set of common zones (LatAm + EU + UTC). Not a full IANA list on purpose. */
export const COMMON_TIMEZONES = [
  'America/La_Paz',
  'America/Lima',
  'America/Bogota',
  'America/Argentina/Buenos_Aires',
  'America/Santiago',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/New_York',
  'Europe/Madrid',
  'Europe/London',
  'UTC',
] as const;

/** The device's own zone; falls back to UTC if the runtime can't resolve it. */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Friendly label for a curated IANA id (last path segment, underscores → spaces). */
export function timezoneLabel(tz: string): string {
  const seg = tz.split('/').pop() ?? tz;
  return seg.replace(/_/g, ' ');
}

interface TimezoneState {
  /** null = device default; string = explicit user override. */
  timezone: string | null;
  /** User-initiated: persist the override (or clear it back to device default). */
  setTimezone: (tz: string | null) => void;
  hydrate: () => Promise<void>;
}

export const useTimezoneStore = create<TimezoneState>((set) => ({
  timezone: null,
  setTimezone: (timezone) => {
    set({ timezone });
    if (timezone) void secureStorage.setItem(KEY, timezone);
    else void secureStorage.removeItem(KEY);
  },
  hydrate: async () => {
    const v = await secureStorage.getItem(KEY);
    if (v) set({ timezone: v });
  },
}));

/**
 * Effective IANA timezone for display (override if set, else device default).
 * Returns a stable primitive, so it is safe to read inside memoized list rows.
 */
export function useTimezone(): string {
  const override = useTimezoneStore((s) => s.timezone);
  return override ?? deviceTimezone();
}
