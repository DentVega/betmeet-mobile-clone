/** Realtime bridge: one channel on matches + prediction_scores invalidates live queries (FR-RT1). */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';

export function useLiveResults() {
  const qc = useQueryClient();
  useEffect(() => {
    const invalidate = () => {
      void qc.invalidateQueries({ queryKey: ['fixture'] });
      void qc.invalidateQueries({ queryKey: ['ranking'] });
    };
    const channel = supabase
      .channel('live-results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prediction_scores' }, invalidate)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
}
