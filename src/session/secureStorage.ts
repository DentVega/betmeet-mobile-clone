/**
 * Encrypted secure-storage adapter over react-native-keychain (ADR-003).
 * Shaped to satisfy the Supabase auth `storage` contract. The ONLY writer of
 * session secrets — enforces the model invariant that no token leaves secure storage.
 */
import * as Keychain from 'react-native-keychain';

export interface SecureStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const SERVICE_PREFIX = 'betmeet.secure.';

const serviceFor = (key: string) => SERVICE_PREFIX + key;

export const secureStorage: SecureStorageAdapter = {
  async getItem(key) {
    const result = await Keychain.getGenericPassword({ service: serviceFor(key) });
    return result ? result.password : null;
  },
  async setItem(key, value) {
    await Keychain.setGenericPassword(key, value, {
      service: serviceFor(key),
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
    });
  },
  async removeItem(key) {
    await Keychain.resetGenericPassword({ service: serviceFor(key) });
  },
};
