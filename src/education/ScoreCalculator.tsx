/** Interactive scoring calculator (Intent 007) — port of the web rules calculator. */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Card } from '../ui/Card';
import { Txt } from '../ui/Text';
import { useTheme } from '../theme/useTheme';
import { scorePreview, type Side } from './scoring';
import { t } from '../i18n';

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const { colors, radius } = useTheme();
  const btn = [styles.btn, { borderColor: colors.border, borderRadius: radius.md }];
  return (
    <View style={styles.stepper}>
      <Txt variant="small" style={styles.stepLabel}>{label}</Txt>
      <View style={styles.stepRow}>
        <Pressable onPress={() => onChange(Math.max(0, value - 1))} style={btn}><Txt variant="title">−</Txt></Pressable>
        <Txt variant="heading" style={styles.val}>{value}</Txt>
        <Pressable onPress={() => onChange(Math.min(20, value + 1))} style={btn}><Txt variant="title">+</Txt></Pressable>
      </View>
    </View>
  );
}

function SidePicker({ value, onChange }: { value: Side; onChange: (s: Side) => void }) {
  const { colors, radius } = useTheme();
  const c = t().calc;
  return (
    <View style={styles.sideRow}>
      {(['home', 'away'] as const).map((s) => {
        const on = value === s;
        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            style={[styles.pill, { borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.accent : 'transparent', borderRadius: radius.full }]}>
            <Txt color={on ? colors.primary : colors.mutedForeground}>{s === 'home' ? c.home : c.away}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function Line({ label, points, on }: { label: string; points: number; on: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.line}>
      <Txt color={on ? colors.foreground : colors.mutedForeground}>{label}</Txt>
      <Txt color={on ? colors.success : colors.mutedForeground} style={styles.linePts}>{on ? `+${points}` : '0'}</Txt>
    </View>
  );
}

export function ScoreCalculator() {
  const c = t().calc;
  const { colors } = useTheme();
  const [ph, setPh] = useState(2);
  const [pa, setPa] = useState(1);
  const [ah, setAh] = useState(2);
  const [aa, setAa] = useState(1);
  const [ko, setKo] = useState(false);
  const [predPen, setPredPen] = useState<Side>(null);
  const [actWin, setActWin] = useState<Side>(null);

  const b = scorePreview({ h: ph, a: pa, pen: predPen }, { h: ah, a: aa, win: actWin }, ko);

  return (
    <Card>
      <Txt variant="title">{c.title}</Txt>

      <Txt variant="muted" style={styles.group}>{c.prediction}</Txt>
      <View style={styles.scoreRow}>
        <Stepper label={c.home} value={ph} onChange={setPh} />
        <Txt variant="heading" color={colors.mutedForeground}>—</Txt>
        <Stepper label={c.away} value={pa} onChange={setPa} />
      </View>

      <Txt variant="muted" style={styles.group}>{c.actual}</Txt>
      <View style={styles.scoreRow}>
        <Stepper label={c.home} value={ah} onChange={setAh} />
        <Txt variant="heading" color={colors.mutedForeground}>—</Txt>
        <Stepper label={c.away} value={aa} onChange={setAa} />
      </View>

      <View style={styles.koRow}>
        <Txt variant="body">{c.knockout}</Txt>
        <Switch value={ko} onValueChange={setKo} />
      </View>
      {ko && (ph === pa || ah === aa) && (
        <View>
          <Txt variant="small" style={styles.group}>{c.penaltyWinner}</Txt>
          {ph === pa && <SidePicker value={predPen} onChange={setPredPen} />}
          {ah === aa && <SidePicker value={actWin} onChange={setActWin} />}
        </View>
      )}

      <View style={[styles.breakdown, { borderTopColor: colors.border }]}>
        {b.exact ? (
          <Line label={c.exact} points={5} on />
        ) : (
          <>
            <Line label={c.result} points={2} on={b.result > 0} />
            <Line label={c.homeGoalPt} points={1} on={b.homeGoal > 0} />
            <Line label={c.awayGoalPt} points={1} on={b.awayGoal > 0} />
          </>
        )}
        {ko && <Line label={c.penaltyBonus} points={1} on={b.penalty > 0} />}
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Txt variant="title">{c.total}</Txt>
          <Txt variant="display" color={colors.primary} style={styles.total}>{b.total}</Txt>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: 14, marginBottom: 6 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 16 },
  stepper: { alignItems: 'center' },
  stepLabel: { marginBottom: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: { borderWidth: 1, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  val: { minWidth: 28, textAlign: 'center' },
  koRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  sideRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  pill: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6 },
  breakdown: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, gap: 6 },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  linePts: { fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  total: { fontSize: 28 },
});
