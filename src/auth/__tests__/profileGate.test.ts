jest.mock('../../session/supabaseClient', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '../../session/supabaseClient';
import { fetchOnboardingCompleted } from '../profileGate';

function mockResult(result: { data: unknown; error: unknown }) {
  (supabase.from as jest.Mock).mockReturnValue({
    select: () => ({
      eq: () => ({ maybeSingle: () => Promise.resolve(result) }),
    }),
  });
}

describe('fetchOnboardingCompleted', () => {
  it('returns true when the flag is set', async () => {
    mockResult({ data: { onboardingCompleted: true }, error: null });
    await expect(fetchOnboardingCompleted('u1')).resolves.toBe(true);
  });

  it('returns false (→ Onboarding) on a query error', async () => {
    mockResult({ data: null, error: { message: 'bad table' } });
    await expect(fetchOnboardingCompleted('u1')).resolves.toBe(false);
  });

  it('returns false when no profile row exists', async () => {
    mockResult({ data: null, error: null });
    await expect(fetchOnboardingCompleted('u1')).resolves.toBe(false);
  });
});
