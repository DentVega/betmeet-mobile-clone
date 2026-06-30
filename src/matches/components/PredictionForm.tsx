/** Modal to submit/edit a prediction (US-M3). Penalty picker only on knockout draw. */
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { FixtureMatch } from '../data/fixture';
import { savePrediction } from '../data/fixtureApi';
import { Button } from '../../ui/Button';
import { t, tr } from '../../i18n';

function clampScore(v: string): number {
  const n = parseInt(v.replace(/[^0-9]/g, '') || '0', 10);
  return Math.max(0, Math.min(20, Number.isNaN(n) ? 0 : n));
}

function ScoreInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <View style={styles.scoreCol}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <TextInput
        style={styles.scoreInput}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={2}
      />
    </View>
  );
}

function PenBtn({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pen, active && styles.penActive]}>
      <Text style={[styles.penText, active && styles.penTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function PredictionForm({ match, onClose }: { match: FixtureMatch; onClose: () => void }) {
  const dict = t().matches;
  const qc = useQueryClient();
  const [home, setHome] = useState(String(match.prediction?.homeScore ?? 0));
  const [away, setAway] = useState(String(match.prediction?.awayScore ?? 0));
  const [pen, setPen] = useState<string | null>(match.prediction?.penaltyWinnerTeamId ?? null);
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
    });
    setLoading(false);
    if (res.ok) {
      await qc.invalidateQueries({ queryKey: ['fixture'] });
      onClose();
    } else {
      setErr(tr('matches.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>
            {match.homeTeam?.name} {dict.vs} {match.awayTeam?.name}
          </Text>
          <View style={styles.scores}>
            <ScoreInput value={home} onChange={setHome} label={match.homeTeam?.fifaCode ?? ''} />
            <Text style={styles.dash}>—</Text>
            <ScoreInput value={away} onChange={setAway} label={match.awayTeam?.fifaCode ?? ''} />
          </View>
          {knockoutDraw && match.homeTeam && match.awayTeam && (
            <View>
              <Text style={styles.penLabel}>{dict.penaltyWinner}</Text>
              <View style={styles.penRow}>
                <PenBtn active={pen === match.homeTeam.id} label={match.homeTeam.fifaCode} onPress={() => setPen(match.homeTeam!.id)} />
                <PenBtn active={pen === match.awayTeam.id} label={match.awayTeam.fifaCode} onPress={() => setPen(match.awayTeam!.id)} />
              </View>
            </View>
          )}
          {!!err && <Text style={styles.err}>{err}</Text>}
          <Button title={dict.save} onPress={onSave} loading={loading} disabled={knockoutDraw && !pen} />
          <Button title={dict.cancel} variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 20 },
  scores: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 16 },
  scoreCol: { alignItems: 'center' },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  scoreInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, width: 64, height: 56, fontSize: 24, textAlign: 'center', color: '#111' },
  dash: { fontSize: 24, color: '#9ca3af', marginBottom: 12 },
  penLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 20, marginBottom: 8, textAlign: 'center' },
  penRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  pen: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  penActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  penText: { fontSize: 16, color: '#111', fontWeight: '600' },
  penTextActive: { color: '#2563eb' },
  err: { color: '#dc2626', fontSize: 14, textAlign: 'center', marginTop: 12 },
});
