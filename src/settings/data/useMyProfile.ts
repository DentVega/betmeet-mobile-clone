/** The signed-in user's profile row (RLS own-row read). */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../session/supabaseClient';
import { useSessionStore } from '../../session/sessionStore';

export interface MyProfile {
  id: string;
  nickname_base: string | null;
  nickname_discriminator: string | null;
  avatar_url: string;
  avatar_source: string;
  locale: string;
  nickname_change_count: number;
}

export function useMyProfile() {
  const userId = useSessionStore((s) => s.userId);
  return useQuery({
    queryKey: ['myProfile', userId],
    enabled: !!userId,
    queryFn: async (): Promise<MyProfile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,nickname_base,nickname_discriminator,avatar_url,avatar_source,locale,nickname_change_count')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data as MyProfile;
    },
  });
}
