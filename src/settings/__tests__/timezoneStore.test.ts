jest.mock('../../session/secureStorage', () => ({
  secureStorage: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

import { secureStorage } from '../../session/secureStorage';
import {
  useTimezoneStore,
  deviceTimezone,
  timezoneLabel,
  COMMON_TIMEZONES,
} from '../timezoneStore';

beforeEach(() => {
  useTimezoneStore.setState({ timezone: null });
  (secureStorage.getItem as jest.Mock).mockReset();
  (secureStorage.setItem as jest.Mock).mockReset();
  (secureStorage.removeItem as jest.Mock).mockReset();
});

describe('timezoneStore', () => {
  it('defaults to null (follow device)', () => {
    expect(useTimezoneStore.getState().timezone).toBeNull();
  });

  it('setTimezone persists an explicit override', () => {
    useTimezoneStore.getState().setTimezone('America/La_Paz');
    expect(useTimezoneStore.getState().timezone).toBe('America/La_Paz');
    expect(secureStorage.setItem).toHaveBeenCalledWith('betmeet.timezone', 'America/La_Paz');
  });

  it('setTimezone(null) clears the override back to device default', () => {
    useTimezoneStore.setState({ timezone: 'Europe/Madrid' });
    useTimezoneStore.getState().setTimezone(null);
    expect(useTimezoneStore.getState().timezone).toBeNull();
    expect(secureStorage.removeItem).toHaveBeenCalledWith('betmeet.timezone');
  });

  it('hydrate applies a persisted override', async () => {
    (secureStorage.getItem as jest.Mock).mockResolvedValue('America/Lima');
    await useTimezoneStore.getState().hydrate();
    expect(useTimezoneStore.getState().timezone).toBe('America/Lima');
  });

  it('hydrate keeps device default when nothing is stored', async () => {
    (secureStorage.getItem as jest.Mock).mockResolvedValue(null);
    await useTimezoneStore.getState().hydrate();
    expect(useTimezoneStore.getState().timezone).toBeNull();
  });

  it('deviceTimezone returns a non-empty IANA string', () => {
    expect(typeof deviceTimezone()).toBe('string');
    expect(deviceTimezone().length).toBeGreaterThan(0);
  });

  it('timezoneLabel humanises curated ids', () => {
    expect(timezoneLabel('America/La_Paz')).toBe('La Paz');
    expect(timezoneLabel('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
    expect(timezoneLabel('UTC')).toBe('UTC');
  });

  it('curated list includes America/La_Paz (Bolivia)', () => {
    expect(COMMON_TIMEZONES).toContain('America/La_Paz');
  });
});
