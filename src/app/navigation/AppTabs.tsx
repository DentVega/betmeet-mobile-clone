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
import { SignOutButton } from '../../auth/SignOutButton';
import { MatchesScreen } from '../../matches/screens/MatchesScreen';
import { PoolsListScreen } from '../../pools/screens/PoolsListScreen';
import { PoolNewScreen } from '../../pools/screens/PoolNewScreen';
import { PoolDiscoverScreen } from '../../pools/screens/PoolDiscoverScreen';
import { PoolDetailScreen } from '../../pools/screens/PoolDetailScreen';
import { PoolJoinScreen } from '../../pools/screens/PoolJoinScreen';
import { t } from '../../i18n';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const PoolsStackNav = createNativeStackNavigator<PoolsStackParamList>();

const RankingsScreen = () => <PlaceholderScreen title="Rankings (Bolt 9)" />;

function PoolsStack() {
  return (
    <PoolsStackNav.Navigator>
      <PoolsStackNav.Screen name="PoolsList" component={PoolsListScreen} options={{ headerShown: false }} />
      <PoolsStackNav.Screen name="PoolNew" component={PoolNewScreen} options={{ title: '' }} />
      <PoolsStackNav.Screen name="PoolDiscover" component={PoolDiscoverScreen} options={{ title: '' }} />
      <PoolsStackNav.Screen name="PoolDetail" component={PoolDetailScreen} options={{ title: '' }} />
      <PoolsStackNav.Screen name="PoolJoin" component={PoolJoinScreen} options={{ title: '' }} />
    </PoolsStackNav.Navigator>
  );
}

export function AppTabs() {
  const dict = t();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <SignOutButton />,
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
