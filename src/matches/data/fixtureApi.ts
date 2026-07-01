/** Submit/edit a global-scope prediction via the save-prediction Edge Function. */
import { supabase } from '../../session/supabaseClient';

export interface SavePredictionInput {
  matchId: string;
  homeScore: number;
  awayScore: number;
  penaltyWinnerTeamId?: string | null;
  /** When set, saves a pool-scoped override (FR-PP1) instead of the global pick. */
  poolId?: string | null;
  alsoSaveAsGlobal?: boolean;
}

export interface SaveResult {
  ok: boolean;
  code?: string;
}

export async function savePrediction(input: SavePredictionInput): Promise<SaveResult> {
  const { data, error } = await supabase.functions.invoke('save-prediction', {
    body: {
      matchId: input.matchId,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      penaltyWinnerTeamId: input.penaltyWinnerTeamId ?? null,
      poolId: input.poolId ?? null,
      alsoSaveAsGlobal: input.alsoSaveAsGlobal ?? false,
    },
  });
  if (error) return { ok: false, code: 'INTERNAL' };
  return data as SaveResult;
}
