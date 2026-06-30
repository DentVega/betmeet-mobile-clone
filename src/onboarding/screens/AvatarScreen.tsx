/** Onboarding step 2 — choose avatar from the default set (US-O3). */
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { t } from '../../i18n';
import { useSessionStore } from '../../session/sessionStore';
import { useAvatarAssets } from '../data/useAvatarAssets';
import { setAvatar } from '../data/onboardingApi';
import { obStyles as s } from './styles';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Avatar'>;

export function AvatarScreen() {
  const navigation = useNavigation<Nav>();
  const dict = t().onboarding.avatar;
  const userId = useSessionStore((st) => st.userId);
  const { data: assets, isLoading } = useAvatarAssets();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    if (!userId || !selected) {
      return;
    }
    setSaving(true);
    await setAvatar(userId, selected, 'DEFAULT_SET');
    setSaving(false);
    navigation.navigate('Rules');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>{dict.title}</Text>
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <View style={s.grid}>
            {(assets ?? []).map((a) => (
              <Pressable key={a.key} onPress={() => setSelected(a.url)}>
                <View style={[s.avatarWrap, selected === a.url && s.avatarSelected]}>
                  <Image source={{ uri: a.url }} style={s.avatar} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
        <Button title={dict.submit} onPress={onContinue} loading={saving} disabled={!selected} />
      </ScrollView>
    </Screen>
  );
}
