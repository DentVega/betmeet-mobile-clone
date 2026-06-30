/** Default avatar catalog (RLS public). */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../session/supabaseClient';

export interface AvatarAsset {
  key: string;
  url: string;
}

export function useAvatarAssets() {
  return useQuery({
    queryKey: ['avatar_assets'],
    queryFn: async (): Promise<AvatarAsset[]> => {
      const { data, error } = await supabase
        .from('avatar_assets')
        .select('key,url')
        .order('sort_order');
      if (error) {
        throw error;
      }
      return (data as AvatarAsset[]) ?? [];
    },
  });
}
