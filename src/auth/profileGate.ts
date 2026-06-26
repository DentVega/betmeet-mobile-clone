/**
 * Resolves the onboarding gate for an authenticated user (closes the Bolt 0
 * TODO). Reads the profile's onboarding flag via PostgREST.
 *
 * DEFENSIVE BY DESIGN: on any error or missing row → `false` (→ Onboarding), so
 * an authenticated user is never stuck at the Booting phase even if the exact
 * table/column names need adjusting. Names are centralized here and confirmed
 * against the live schema in Bolt 2 (write-path audit).
 */
import { supabase } from '../session/supabaseClient';

const PROFILE_TABLE = 'Profile';
const ONBOARDING_COL = 'onboardingCompleted';
const ID_COL = 'id';

export async function fetchOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .select(ONBOARDING_COL)
      .eq(ID_COL, userId)
      .maybeSingle();
    if (error || !data) {
      return false;
    }
    return Boolean((data as Record<string, unknown>)[ONBOARDING_COL]);
  } catch {
    return false;
  }
}
