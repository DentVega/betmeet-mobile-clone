/**
 * App-level stack (Intent 005): the bottom Tabs + a root Profile screen presented
 * over them, so the navbar avatar opens Profile without switching the active tab.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from './types';
import { AppTabs } from './AppTabs';
import { ProfileScreen } from '../../settings/screens/ProfileScreen';
import { useTheme } from '../../theme/useTheme';
import { fonts } from '../../theme/tokens';
import { t } from '../../i18n';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t().profile.title,
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.foreground, fontFamily: fonts.displayBold },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </Stack.Navigator>
  );
}
