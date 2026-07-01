jest.mock('../../session/secureStorage', () => ({
  secureStorage: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

import { secureStorage } from '../../session/secureStorage';
import { useLocaleStore } from '../localeStore';
import { getLocale } from '../index';

beforeEach(() => {
  useLocaleStore.setState({ locale: 'es' });
  (secureStorage.getItem as jest.Mock).mockReset();
  (secureStorage.setItem as jest.Mock).mockReset();
});

describe('localeStore', () => {
  it('setLocale updates store, mirrors i18n, and persists', () => {
    useLocaleStore.getState().setLocale('en');
    expect(useLocaleStore.getState().locale).toBe('en');
    expect(getLocale()).toBe('en');
    expect(secureStorage.setItem).toHaveBeenCalledWith('betmeet.locale', 'en');
  });

  it('hydrate applies a persisted locale', async () => {
    (secureStorage.getItem as jest.Mock).mockResolvedValue('en');
    await useLocaleStore.getState().hydrate();
    expect(useLocaleStore.getState().locale).toBe('en');
    expect(getLocale()).toBe('en');
  });

  it('hydrate falls back to a valid default when nothing is stored', async () => {
    (secureStorage.getItem as jest.Mock).mockResolvedValue(null);
    await useLocaleStore.getState().hydrate();
    expect(['es', 'en']).toContain(useLocaleStore.getState().locale);
  });
});
