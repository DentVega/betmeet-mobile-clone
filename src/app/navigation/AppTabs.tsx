/**
 * Authenticated app shell: bottom tabs (Matches | Pools | Rankings). Pools is a
 * nested stack so deep-link joins can target PoolJoin. Placeholder screens in
 * Bolt 0 — real features land in Bolts 4/5/6.
 */
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppTabsParamList, PoolsStackParamList } from './types';
import { SignOutButton } from '../../auth/SignOutButton';
import { ThemeCycleButton } from '../../ui/ThemeSwitcher';
import { LocaleCycleButton } from '../../ui/LocaleSwitcher';
import { MatchesScreen } from '../../matches/screens/MatchesScreen';
import { PoolsListScreen } from '../../pools/screens/PoolsListScreen';
import { PoolNewScreen } from '../../pools/screens/PoolNewScreen';
import { PoolDiscoverScreen } from '../../pools/screens/PoolDiscoverScreen';
import { PoolDetailScreen } from '../../pools/screens/PoolDetailScreen';
import { PoolJoinScreen } from '../../pools/screens/PoolJoinScreen';
import { RankingsScreen } from '../../leaderboard/screens/RankingsScreen';
import { PoolLeaderboardScreen } from '../../leaderboard/screens/PoolLeaderboardScreen';
import { t } from '../../i18n';
import { useTheme } from '../../theme/useTheme';
import { fonts } from '../../theme/tokens';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const PoolsStackNav = createNativeStackNavigator<PoolsStackParamList>();

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

export function AppTabs() {
  const dict = t();
  const { colors } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemeCycleButton />
            <LocaleCycleButton />
          </View>
        ),
        headerRight: () => <SignOutButton />,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.foreground, fontFamily: fonts.displayBold },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: fonts.sansMedium },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}>
      <Tabs.Screen
        name="Matches"
        component={MatchesScreen}
        options={{ title: dict.tabs.matches }}
      />
      <Tabs.Screen
        name="Pools"
        component={PoolsStack}
        options={{ title: dict.tabs.pools }}
      />
      <Tabs.Screen
        name="Rankings"
        component={RankingsScreen}
        options={{ title: dict.tabs.rankings }}
      />
    </Tabs.Navigator>
  );
}
