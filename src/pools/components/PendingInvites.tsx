/** Pending directed invites for me — Accept/Decline (US-PD1 receive side). */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '../../ui/Card';
import { Txt } from '../../ui/Text';
import { Button } from '../../ui/Button';
import { useTheme } from '../../theme/useTheme';
import { useMyInvites } from '../data/usePoolDepth';
import { respondInvite } from '../data/poolDepthApi';
import { t } from '../../i18n';

export function PendingInvites() {
  const dict = t().pools;
  const { colors } = useTheme();
  const qc = useQueryClient();
  const { data: invites } = useMyInvites();

  if (!invites || invites.length === 0) return null;

  const respond = async (id: string, accept: boolean) => {
    await respondInvite(id, accept);
    await qc.invalidateQueries({ queryKey: ['invites'] });
    await qc.invalidateQueries({ queryKey: ['pools'] });
  };

  return (
    <View style={styles.wrap}>
      <Txt variant="muted" style={styles.header}>{dict.pendingInvites.toUpperCase()}</Txt>
      {invites.map((inv) => (
        <Card key={inv.id}>
          <Txt variant="title">{inv.poolName}</Txt>
          <Txt variant="small" style={styles.by}>{inv.inviter}</Txt>
          <View style={styles.actions}>
            <View style={styles.flex}><Button title={dict.accept} onPress={() => respond(inv.id, true)} /></View>
            <View style={styles.flex}><Button title={dict.decline} variant="secondary" onPress={() => respond(inv.id, false)} /></View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  header: { marginLeft: 4, letterSpacing: 0.5 },
  by: { marginTop: 2, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
