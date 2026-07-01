/** Shared navbar right side: language toggle + profile avatar → Profile screen (Intent 004). */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useNavigation } from '@react-navigation/native';
import { LocaleCycleButton } from './LocaleSwitcher';
import { Avatar } from './Avatar';
import { useMyProfile } from '../settings/data/useMyProfile';

export function AppHeaderRight() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>();
  const { data: profile } = useMyProfile();
  return (
    <View style={styles.row}>
      <LocaleCycleButton />
      <Pressable
        onPress={() => nav.navigate('Profile')}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="profile"
        style={styles.avatar}>
        <Avatar url={profile?.avatar_url ?? 'local-1'} size={30} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 12 },
  avatar: { borderRadius: 15, overflow: 'hidden' },
});
