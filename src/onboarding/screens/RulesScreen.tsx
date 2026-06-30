/** Onboarding step 3 — acknowledge rules + complete (US-O4). */
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { t } from '../../i18n';
import { useSessionStore } from '../../session/sessionStore';
import { completeOnboarding } from '../data/onboardingApi';
import { useObStyles } from './styles';

export function RulesScreen() {
  const dict = t().onboarding.rules;
  const s = useObStyles();
  const userId = useSessionStore((st) => st.userId);
  const setOnboardingCompleted = useSessionStore((st) => st.setOnboardingCompleted);
  const [loading, setLoading] = useState(false);

  const onAcknowledge = async () => {
    if (!userId) {
      return;
    }
    setLoading(true);
    const res = await completeOnboarding(userId);
    setLoading(false);
    if (res.ok) {
      // Flip the gate → resolveAppPhase advances Onboarding → App (declarative).
      setOnboardingCompleted(true);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>{dict.title}</Text>
        <Text style={s.body}>{dict.body}</Text>
        <Button title={dict.acknowledge} onPress={onAcknowledge} loading={loading} />
      </ScrollView>
    </Screen>
  );
}
