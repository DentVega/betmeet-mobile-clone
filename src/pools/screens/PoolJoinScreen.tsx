/** Join by token / deep link (US-P4). Lands here from betmeet://pools/join/TOKEN. */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { joinPoolByToken } from '../data/poolsApi';
import { t, tr } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolJoin'>;
type Route = RouteProp<PoolsStackParamList, 'PoolJoin'>;

export function PoolJoinScreen() {
  const nav = useNavigation<Nav>();
  const { token } = useRoute<Route>().params;
  const qc = useQueryClient();
  const dict = t().pools;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    joinPoolByToken(token).then(async (res) => {
      if (!active) return;
      if (res.ok && res.poolId) {
        await qc.invalidateQueries({ queryKey: ['pools'] });
        nav.replace('PoolDetail', { poolId: res.poolId });
      } else {
        setError(tr('pools.errors.' + (res.code ?? 'INTERNAL')));
      }
    });
    return () => { active = false; };
  }, [token, nav, qc]);

  return (
    <Screen>
      <View style={styles.center}>
        {error ? (
          <>
            <Text style={styles.err}>{error}</Text>
            <Button title={dict.discover} onPress={() => nav.replace('PoolsList')} />
          </>
        ) : (
          <>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>{dict.joining}</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  text: { color: '#6b7280' },
  err: { color: '#dc2626', fontSize: 15, textAlign: 'center' },
});
