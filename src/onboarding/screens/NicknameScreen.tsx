/** Onboarding step 1 — choose nickname (US-O2). */
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { t, tr } from '../../i18n';
import { setNickname } from '../data/onboardingApi';
import { useObStyles } from './styles';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Nickname'>;
const NICK_RE = /^[A-Za-z0-9_-]{3,20}$/;

export function NicknameScreen() {
  const navigation = useNavigation<Nav>();
  const dict = t().onboarding.nickname;
  const s = useObStyles();
  const [base, setBase] = useState('');
  const [assigned, setAssigned] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const valid = NICK_RE.test(base.trim());

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const res = await setNickname(base.trim());
    setLoading(false);
    if (res.ok && res.nickname) {
      setAssigned(res.nickname);
    } else {
      setError(tr('onboarding.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{dict.title}</Text>
        <Text style={s.help}>{dict.help}</Text>
        <TextField
          label={dict.label}
          value={base}
          onChangeText={(v) => {
            setBase(v);
            setAssigned(null);
          }}
          autoCapitalize="none"
          maxLength={20}
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        {!!assigned && <Text style={s.assigned}>{dict.assigned} {assigned}</Text>}
        {assigned ? (
          <Button title={dict.submit} onPress={() => navigation.navigate('Avatar')} />
        ) : (
          <Button title={dict.submit} onPress={onSubmit} loading={loading} disabled={!valid} />
        )}
      </ScrollView>
    </Screen>
  );
}
