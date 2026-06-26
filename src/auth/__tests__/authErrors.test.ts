import { mapAuthError } from '../authErrors';

describe('mapAuthError', () => {
  it('maps invalid credentials', () => {
    expect(mapAuthError({ code: 'invalid_credentials' }).kind).toBe('invalidCredentials');
  });
  it('maps email not confirmed', () => {
    expect(mapAuthError({ code: 'email_not_confirmed' }).kind).toBe('emailNotConfirmed');
  });
  it('maps email already in use (by message)', () => {
    expect(mapAuthError({ message: 'User already registered' }).kind).toBe('emailAlreadyInUse');
  });
  it('maps weak password', () => {
    expect(mapAuthError({ code: 'weak_password' }).kind).toBe('weakPassword');
  });
  it('maps rate limiting by status 429', () => {
    expect(mapAuthError({ status: 429 }).kind).toBe('rateLimited');
  });
  it('maps network failures', () => {
    expect(mapAuthError({ message: 'Network request failed' }).kind).toBe('network');
  });
  it('falls back to unknown', () => {
    expect(mapAuthError({ message: 'something odd' }).kind).toBe('unknown');
  });
  it('always returns a message key, even for null', () => {
    expect(mapAuthError(null).messageKey).toBe('auth.errors.unknown');
  });
});
