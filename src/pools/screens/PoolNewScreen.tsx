/** Create a pool (US-P2). */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { PoolsStackParamList } from '../../app/navigation/types';
import { Screen } from '../../ui/Screen';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { createPool } from '../data/poolsApi';
import { t, tr } from '../../i18n';

type Nav = NativeStackNavigationProp<PoolsStackParamList, 'PoolNew'>;

export function PoolNewScreen() {
  const nav = useNavigation<Nav>();
  const qc = useQueryClient();
  const dict = t().pools;
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
        <Text style={styles.typeLabel}>{dict.typeLabel}</Text>
        <View style={styles.typeRow}>
          {(['PUBLIC', 'PRIVATE'] as const).map((tp) => (
            <Pressable key={tp} onPress={() => setType(tp)} style={[styles.type, type === tp && styles.typeActive]}>
              <Text style={[styles.typeText, type === tp && styles.typeTextActive]}>
                {tp === 'PUBLIC' ? dict.public : dict.private}
              </Text>
            </Pressable>
          ))}
        </View>
        {!!err && <Text style={styles.err}>{err}</Text>}
        <Button title={dict.submit} onPress={onSubmit} loading={loading} disabled={!valid} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  typeLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  type: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  typeActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  typeText: { fontSize: 15, color: '#111', fontWeight: '600' },
  typeTextActive: { color: '#2563eb' },
  err: { color: '#dc2626', fontSize: 14, marginBottom: 8, textAlign: 'center' },
});
