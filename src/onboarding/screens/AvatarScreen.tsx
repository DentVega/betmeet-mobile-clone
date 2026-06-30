/** Onboarding step 2 — choose avatar from the default set (US-O3), local SVGs. */
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Txt } from '../../ui/Text';
import { Avatar } from '../../ui/Avatar';
import { avatarKeys } from '../../assets/avatars';
import { useSessionStore } from '../../session/sessionStore';
import { setAvatar } from '../data/onboardingApi';
import { useObStyles } from './styles';
import { t } from '../../i18n';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Avatar'>;

export function AvatarScreen() {
  const navigation = useNavigation<Nav>();
  const dict = t().onboarding.avatar;
  const s = useObStyles();
  const userId = useSessionStore((st) => st.userId);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    if (!userId || !selected) return;
    setSaving(true);
    await setAvatar(userId, selected, 'DEFAULT_SET');
    setSaving(false);
    navigation.navigate('Rules');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content}>
        <Txt variant="heading" style={s.title}>{dict.title}</Txt>
        <View style={s.grid}>
          {avatarKeys.map((key) => (
            <Pressable key={key} onPress={() => setSelected(key)}>
              <View style={[s.avatarWrap, selected === key && s.avatarSelected]}>
                <Avatar url={key} size={72} />
              </View>
            </Pressable>
          ))}
        </View>
        <Button title={dict.submit} onPress={onContinue} loading={saving} disabled={!selected} />
      </ScrollView>
    </Screen>
  );
}
