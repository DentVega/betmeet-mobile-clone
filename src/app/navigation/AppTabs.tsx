/**
 * Authenticated app shell: bottom tabs (Matches | Pools | Rankings | Settings).
 * Pools/Settings are nested stacks. Theme/locale controls + sign-out moved into
 * Settings (Bolt V2) — headers are now titles only.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppTabsParamList, PoolsStackParamList, SettingsStackParamList } from './types';
import { MatchesScreen } from '../../matches/screens/MatchesScreen';
import { PoolsListScreen } from '../../pools/screens/PoolsListScreen';
import { PoolNewScreen } from '../../pools/screens/PoolNewScreen';
import { PoolDiscoverScreen } from '../../pools/screens/PoolDiscoverScreen';
import { PoolDetailScreen } from '../../pools/screens/PoolDetailScreen';
import { PoolJoinScreen } from '../../pools/screens/PoolJoinScreen';
import { PoolLeaderboardScreen } from '../../leaderboard/screens/PoolLeaderboardScreen';
import { RankingsScreen } from '../../leaderboard/screens/RankingsScreen';
import { SettingsScreen } from '../../settings/screens/SettingsScreen';
import { t } from '../../i18n';
import { useTheme } from '../../theme/useTheme';
import { fonts } from '../../theme/tokens';
import { useLiveResults } from '../../session/useLiveResults';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const PoolsStackNav = createNativeStackNavigator<PoolsStackParamList>();
const SettingsStackNav = createNativeStackNavigator<SettingsStackParamList>();

function PoolsStack() {
  const { colors } = useTheme();
  return (
    <PoolsStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.foreground },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <PoolsStackNav.Screen name="PoolsList" component={PoolsListScreen} options={{ headerShown: false }} />
      <PoolsStackNav.Screen name="PoolNew" component={PoolNewScreen} options={{ title: '' }} />
      <PoolsStackNav.Screen name="PoolDiscover" component={PoolDiscoverScreen} options={{ title: '' }} />
      <PoolsStackNav.Screen name="PoolDetail" component={PoolDetailScreen} options={{ title: '' }} />
      <PoolsStackNav.Screen name="PoolLeaderboard" component={PoolLeaderboardScreen} options={{ title: '' }} />
      <PoolsStackNav.Screen name="PoolJoin" component={PoolJoinScreen} options={{ title: '' }} />
    </PoolsStackNav.Navigator>
  );
}

function SettingsStack() {
  const { colors } = useTheme();
  return (
    <SettingsStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.foreground, fontFamily: fonts.displayBold },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <SettingsStackNav.Screen name="SettingsHome" component={SettingsScreen} options={{ title: t().settings.title }} />
    </SettingsStackNav.Navigator>
  );
}

export function AppTabs() {
  const dict = t();
  const { colors } = useTheme();
  useLiveResults();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.foreground, fontFamily: fonts.displayBold },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: fonts.sansMedium },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}>
      <Tabs.Screen name="Matches" component={MatchesScreen} options={{ title: dict.tabs.matches }} />
      <Tabs.Screen name="Pools" component={PoolsStack} options={{ title: dict.tabs.pools, headerShown: false }} />
      <Tabs.Screen name="Rankings" component={RankingsScreen} options={{ title: dict.tabs.rankings }} />
      <Tabs.Screen name="Settings" component={SettingsStack} options={{ title: dict.settings.title, headerShown: false }} />
    </Tabs.Navigator>
  );
}
