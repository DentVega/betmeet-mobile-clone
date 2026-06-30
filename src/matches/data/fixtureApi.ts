/** Submit/edit a global-scope prediction via the save-prediction Edge Function. */
import { supabase } from '../../session/supabaseClient';

export interface SavePredictionInput {
  matchId: string;
  homeScore: number;
  awayScore: number;
  penaltyWinnerTeamId?: string | null;
}

export interface SaveResult {
  ok: boolean;
  code?: string;
}

export async function savePrediction(input: SavePredictionInput): Promise<SaveResult> {
  const { data, error } = await supabase.functions.invoke('save-prediction', {
    body: { ...input, poolId: null },
  });
  if (error) return { ok: false, code: 'INTERNAL' };
  return data as SaveResult;
}
