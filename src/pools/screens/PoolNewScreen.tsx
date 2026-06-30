/** Create a pool (US-P2), themed. */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { Txt } from '../../ui/Text';
import { useTheme } from '../../theme/useTheme';
import { createPool } from '../data/poolsApi';
import { t, tr } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolNew'>;

export function PoolNewScreen() {
  const nav = useNavigation<Nav>();
  const qc = useQueryClient();
  const dict = t().pools;
  const { colors, radius } = useTheme();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [type, setType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cap = parseInt(capacity.replace(/[^0-9]/g, '') || '0', 10);
  const valid = name.trim().length >= 3 && name.trim().length <= 60 && cap >= 2 && cap <= 100;

  const onSubmit = async () => {
    setErr(null);
    setLoading(true);
    const res = await createPool(name.trim(), cap, type);
    setLoading(false);
    if (res.ok && res.poolId) {
      await qc.invalidateQueries({ queryKey: ['pools'] });
      nav.replace('PoolDetail', { poolId: res.poolId });
    } else {
      setErr(tr('pools.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label={dict.nameLabel} value={name} onChangeText={setName} maxLength={60} autoCapitalize="sentences" />
        <TextField label={dict.capacityLabel} value={capacity} onChangeText={setCapacity} keyboardType="number-pad" maxLength={3} />
        <Txt style={styles.typeLabel}>{dict.typeLabel}</Txt>
        <View style={styles.typeRow}>
          {(['PUBLIC', 'PRIVATE'] as const).map((tp) => {
            const active = type === tp;
            return (
              <Pressable
                key={tp}
                onPress={() => setType(tp)}
                style={[styles.type, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accent : 'transparent', borderRadius: radius.md }]}>
                <Txt color={active ? colors.primary : colors.foreground} style={styles.typeText}>
                  {tp === 'PUBLIC' ? dict.public : dict.private}
                </Txt>
              </Pressable>
            );
          })}
        </View>
        {!!err && <Txt color={colors.destructive} style={styles.err}>{err}</Txt>}
        <Button title={dict.submit} onPress={onSubmit} loading={loading} disabled={!valid} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  typeLabel: { fontWeight: '600', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  type: { flex: 1, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  typeText: { fontWeight: '600' },
  err: { marginBottom: 8, textAlign: 'center' },
});
