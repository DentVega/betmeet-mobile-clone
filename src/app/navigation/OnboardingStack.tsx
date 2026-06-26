/**
 * Onboarding stack. Placeholder screens in Bolt 0 — real wizard lands in Bolt 3.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { PlaceholderScreen } from '../../ui/Screen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const NicknameScreen = () => <PlaceholderScreen title="Nickname (Bolt 3)" />;
const AvatarScreen = () => <PlaceholderScreen title="Avatar (Bolt 3)" />;
const RulesScreen = () => <PlaceholderScreen title="Rules (Bolt 3)" />;

export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Nickname" component={NicknameScreen} />
      <Stack.Screen name="Avatar" component={AvatarScreen} />
      <Stack.Screen name="Rules" component={RulesScreen} />
    </Stack.Navigator>
  );
}
