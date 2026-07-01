/** Read-only profile view (Intent 004): avatar + nickname + email; edit lives in Settings. */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../app/navigation/types';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Avatar } from '../../ui/Avatar';
import { Txt } from '../../ui/Text';
import { Button } from '../../ui/Button';
import { supabase } from '../../session/supabaseClient';
import { useMyProfile } from '../data/useMyProfile';
import { t } from '../../i18n';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Profile'>;

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { data: profile, isLoading } = useMyProfile();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  if (isLoading || !profile) return <BootingScreen />;
  const nick = `${profile.nickname_base ?? '—'}#${profile.nickname_discriminator ?? ''}`;

  return (
    <Screen>
      <View style={styles.content}>
        <Avatar url={profile.avatar_url} size={104} />
        <Txt variant="display" style={styles.nick}>{nick}</Txt>
        {!!email && <Txt variant="muted">{email}</Txt>}
        <View style={styles.spacer} />
        <Button title={t().profile.edit} variant="secondary" onPress={() => nav.navigate('SettingsHome')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', padding: 24, gap: 8 },
  nick: { marginTop: 12, fontSize: 24 },
  spacer: { height: 24 },
});
