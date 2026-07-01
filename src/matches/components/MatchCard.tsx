/** One fixture match row (memoized, themed). Opens the form when editable. */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { FixtureMatch } from '../data/fixture';
import { canEdit } from '../data/fixture';
import { t, getLocale } from '../../i18n';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Txt } from '../../ui/Text';
import { Flag } from '../../ui/Flag';

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function kickoffTime(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat(getLocale(), { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(iso));
}

const statusTone = (s: FixtureMatch['status']) =>
  s === 'LIVE' ? 'live' : s === 'FINISHED' ? 'success' : 'neutral';

interface Props {
  match: FixtureMatch;
  onPredict: (m: FixtureMatch) => void;
}

function MatchCardBase({ match, onPredict }: Props) {
  const dict = t().matches;
  const { colors } = useTheme();
  const home = match.homeTeam?.fifaCode ?? match.homePlaceholder ?? '—';
  const away = match.awayTeam?.fifaCode ?? match.awayPlaceholder ?? '—';
  const editable = canEdit(match, new Date());
  const live = match.status === 'LIVE';
  const showScore = (live || match.status === 'FINISHED') && match.homeScore !== null;
  const pred = match.prediction;

  return (
    <Pressable disabled={!editable} onPress={() => onPredict(match)} style={styles.wrap}>
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.teamsRow}>
            <Flag iso={match.homeTeam?.iso} />
            <Txt variant="title" numberOfLines={1} style={styles.team}>{home}</Txt>
            <Txt variant="muted">{dict.vs}</Txt>
            <Flag iso={match.awayTeam?.iso} />
            <Txt variant="title" numberOfLines={1} style={styles.team}>{away}</Txt>
          </View>
          <View style={styles.badgeWrap}>
            <Badge label={dict.statuses[match.status]} tone={statusTone(match.status)} />
          </View>
        </View>
        <Txt variant="muted" style={styles.kickoff}>{kickoffTime(match.kickoffAt)}</Txt>

        {showScore && (
          <Txt variant="heading" color={live ? colors.live : undefined} style={styles.result}>
            {match.homeScore} — {match.awayScore}
          </Txt>
        )}

        {pred ? (
          <View style={styles.predRow}>
            <Txt variant="body">{dict.yourPick}: {pred.homeScore}—{pred.awayScore}</Txt>
            {match.score && (
              <Txt variant="body" color={colors.success} style={styles.bold}>
                +{match.score.totalPoints} {dict.points}
              </Txt>
            )}
          </View>
        ) : (
          editable && <Txt variant="body" color={colors.primary} style={styles.cta}>{dict.predict}</Txt>
        )}
        {pred && editable && <Txt variant="body" color={colors.primary} style={styles.cta}>{dict.edit}</Txt>}
      </Card>
    </Pressable>
  );
}

export const MatchCard = React.memo(MatchCardBase);

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginVertical: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' },
  team: { flexShrink: 1 },
  badgeWrap: { flexShrink: 0 },
  kickoff: { marginTop: 2 },
  result: { marginTop: 6 },
  predRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  bold: { fontWeight: '700' },
  cta: { fontWeight: '600', marginTop: 8 },
});
