/**
 * Onboarding stack (Bolt 6). Real wizard: Nickname → Avatar → Rules.
 * Gates the app shell until onboarding_completed flips (ADR-012).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { NicknameScreen } from '../../onboarding/screens/NicknameScreen';
import { AvatarScreen } from '../../onboarding/screens/AvatarScreen';
import { RulesScreen } from '../../onboarding/screens/RulesScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Nickname" component={NicknameScreen} />
      <Stack.Screen name="Avatar" component={AvatarScreen} />
      <Stack.Screen name="Rules" component={RulesScreen} />
    </Stack.Navigator>
  );
}
