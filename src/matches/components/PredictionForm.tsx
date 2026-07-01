/** Modal to submit/edit a prediction (US-M3), themed. Penalty picker only on knockout draw. */
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { FixtureMatch } from '../data/fixture';
import { savePrediction } from '../data/fixtureApi';
import { Button } from '../../ui/Button';
import { Txt } from '../../ui/Text';
import { useTheme } from '../../theme/useTheme';
import { t, tr } from '../../i18n';

function clampScore(v: string): number {
  const n = parseInt(v.replace(/[^0-9]/g, '') || '0', 10);
  return Math.max(0, Math.min(20, Number.isNaN(n) ? 0 : n));
}

export function PredictionForm({
  match,
  poolId,
  onClose,
}: {
  match: FixtureMatch;
  /** When set, saves a pool-scoped override (FR-PP1). */
  poolId?: string;
  onClose: () => void;
}) {
  const dict = t().matches;
  const pdict = t().pools;
  const { colors, radius } = useTheme();
  const qc = useQueryClient();
  const [home, setHome] = useState(String(match.prediction?.homeScore ?? 0));
  const [away, setAway] = useState(String(match.prediction?.awayScore ?? 0));
  const [pen, setPen] = useState<string | null>(match.prediction?.penaltyWinnerTeamId ?? null);
  const [alsoGlobal, setAlsoGlobal] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const h = clampScore(home);
  const a = clampScore(away);
  const knockoutDraw = match.phaseType === 'KNOCKOUT' && h === a;

  const onSave = async () => {
    setErr(null);
    setLoading(true);
    const res = await savePrediction({
      matchId: match.id,
      homeScore: h,
      awayScore: a,
      penaltyWinnerTeamId: knockoutDraw ? pen : null,
      poolId: poolId ?? null,
      alsoSaveAsGlobal: poolId ? alsoGlobal : false,
    });
    setLoading(false);
    if (res.ok) {
      await qc.invalidateQueries({ queryKey: ['fixture'] });
      if (poolId) await qc.invalidateQueries({ queryKey: ['poolPredictions', poolId] });
      onClose();
    } else {
      setErr(tr('matches.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  const scoreInput = [
    styles.scoreInput,
    { borderColor: colors.input, color: colors.foreground, borderRadius: radius.md, backgroundColor: colors.background },
  ];

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Txt variant="title" style={styles.title}>
            {match.homeTeam?.name} {dict.vs} {match.awayTeam?.name}
          </Txt>
          <View style={styles.scores}>
            <View style={styles.scoreCol}>
              <Txt variant="muted" style={styles.scoreLabel}>{match.homeTeam?.fifaCode ?? ''}</Txt>
              <TextInput style={scoreInput} value={home} onChangeText={setHome} keyboardType="number-pad" maxLength={2} />
            </View>
            <Txt variant="heading" color={colors.mutedForeground} style={styles.dash}>—</Txt>
            <View style={styles.scoreCol}>
              <Txt variant="muted" style={styles.scoreLabel}>{match.awayTeam?.fifaCode ?? ''}</Txt>
              <TextInput style={scoreInput} value={away} onChangeText={setAway} keyboardType="number-pad" maxLength={2} />
            </View>
          </View>
          {knockoutDraw && match.homeTeam && match.awayTeam && (
            <View>
              <Txt variant="muted" style={styles.penLabel}>{dict.penaltyWinner}</Txt>
              <View style={styles.penRow}>
                {[match.homeTeam, match.awayTeam].map((tm) => {
                  const active = pen === tm.id;
                  return (
                    <Pressable
                      key={tm.id}
                      onPress={() => setPen(tm.id)}
                      style={[
                        styles.pen,
                        { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accent : 'transparent', borderRadius: radius.md },
                      ]}>
                      <Text style={{ color: active ? colors.primary : colors.foreground, fontWeight: '600', fontSize: 16 }}>{tm.fifaCode}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
          {poolId && (
            <>
              <Txt variant="small" style={styles.penLabel}>{pdict.overrideHint}</Txt>
              <Pressable onPress={() => setAlsoGlobal((v) => !v)} style={styles.alsoRow}>
                <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: alsoGlobal ? colors.primary : 'transparent' }]} />
                <Txt variant="body">{pdict.alsoGlobal}</Txt>
              </Pressable>
            </>
          )}
          {!!err && <Txt color={colors.destructive} style={styles.err}>{err}</Txt>}
          <Button title={dict.save} onPress={onSave} loading={loading} disabled={knockoutDraw && !pen} />
          <Button title={dict.cancel} variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, padding: 24 },
  title: { textAlign: 'center', marginBottom: 20 },
  scores: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 16 },
  scoreCol: { alignItems: 'center' },
  scoreLabel: { marginBottom: 6, fontWeight: '600' },
  scoreInput: { borderWidth: 1, width: 64, height: 56, fontSize: 24, textAlign: 'center' },
  dash: { marginBottom: 12 },
  penLabel: { marginTop: 20, marginBottom: 8, textAlign: 'center', fontWeight: '600' },
  penRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  pen: { borderWidth: 1, paddingVertical: 10, paddingHorizontal: 20 },
  err: { textAlign: 'center', marginTop: 12 },
  alsoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 4 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderRadius: 4 },
});
