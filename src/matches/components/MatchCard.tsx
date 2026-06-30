/** One fixture match row (memoized for FlashList). Opens the form when editable. */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FixtureMatch } from '../data/fixture';
import { canEdit } from '../data/fixture';
import { t, getLocale } from '../../i18n';

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function kickoffTime(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat(getLocale(), { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(iso));
}

interface Props {
  match: FixtureMatch;
  onPredict: (m: FixtureMatch) => void;
}

function MatchCardBase({ match, onPredict }: Props) {
  const dict = t().matches;
  const home = match.homeTeam?.fifaCode ?? match.homePlaceholder ?? '—';
  const away = match.awayTeam?.fifaCode ?? match.awayPlaceholder ?? '—';
  const editable = canEdit(match, new Date());
  const finished = match.status === 'FINISHED';
  const pred = match.prediction;

  return (
    <Pressable
      style={styles.card}
      disabled={!editable}
      onPress={() => onPredict(match)}>
      <View style={styles.headerRow}>
        <Text style={styles.teams}>{home} {dict.vs} {away}</Text>
        <Text style={styles.status}>{dict.statuses[match.status]}</Text>
      </View>
      <Text style={styles.kickoff}>{kickoffTime(match.kickoffAt)}</Text>

      {finished && match.homeScore !== null && (
        <Text style={styles.result}>{match.homeScore} — {match.awayScore}</Text>
      )}

      {pred ? (
        <View style={styles.predRow}>
          <Text style={styles.predText}>
            {dict.yourPick}: {pred.homeScore}—{pred.awayScore}
          </Text>
          {match.score && <Text style={styles.points}>+{match.score.totalPoints} {dict.points}</Text>}
        </View>
      ) : (
        editable && <Text style={styles.cta}>{dict.predict}</Text>
      )}
      {pred && editable && <Text style={styles.cta}>{dict.edit}</Text>}
    </Pressable>
  );
}

export const MatchCard = React.memo(MatchCardBase);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginHorizontal: 16, marginVertical: 6, borderWidth: 1, borderColor: '#eee' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teams: { fontSize: 16, fontWeight: '700', color: '#111' },
  status: { fontSize: 12, color: '#6b7280' },
  kickoff: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  result: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 6 },
  predRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  predText: { fontSize: 14, color: '#374151' },
  points: { fontSize: 14, fontWeight: '700', color: '#15803d' },
  cta: { fontSize: 14, color: '#2563eb', fontWeight: '600', marginTop: 8 },
});
