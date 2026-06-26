/**
 * Authenticated app shell: bottom tabs (Matches | Pools | Rankings). Pools is a
 * nested stack so deep-link joins can target PoolJoin. Placeholder screens in
 * Bolt 0 — real features land in Bolts 4/5/6.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppTabsParamList, PoolsStackParamList } from './types';
import { PlaceholderScreen } from '../../ui/Screen';
import { t } from '../../i18n';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const PoolsStackNav = createNativeStackNavigator<PoolsStackParamList>();

const MatchesScreen = () => <PlaceholderScreen title="Matches (Bolt 4)" />;
const RankingsScreen = () => <PlaceholderScreen title="Rankings (Bolt 6)" />;
const PoolsListScreen = () => <PlaceholderScreen title="Pools (Bolt 5)" />;
const PoolJoinScreen = () => <PlaceholderScreen title="Join pool (Bolt 5)" />;

function PoolsStack() {
  return (
    <PoolsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <PoolsStackNav.Screen name="PoolsList" component={PoolsListScreen} />
      <PoolsStackNav.Screen name="PoolJoin" component={PoolJoinScreen} />
    </PoolsStackNav.Navigator>
  );
}

export function AppTabs() {
  const dict = t();
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
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
