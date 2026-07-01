/** Profile screen (Intent 004/006): view + edit nickname & avatar. */
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, BootingScreen } from '../../ui/Screen';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { Txt } from '../../ui/Text';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { avatarKeys } from '../../assets/avatars';
import { useTheme } from '../../theme/useTheme';
import { supabase } from '../../session/supabaseClient';
import { useSessionStore } from '../../session/sessionStore';
import { useMyProfile } from '../data/useMyProfile';
import { changeNickname, setAvatar, googleAvatarUrl } from '../data/profileApi';
import { t, tr } from '../../i18n';

const NICK_RE = /^[A-Za-z0-9_-]{3,20}$/;

export function ProfileScreen() {
  const dict = t().settings;
  const { colors } = useTheme();
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const { data: profile, isLoading } = useMyProfile();

  const [email, setEmail] = useState<string | null>(null);
  const [nick, setNick] = useState('');
  const [nickErr, setNickErr] = useState<string | null>(null);
  const [nickDone, setNickDone] = useState(false);
  const [nickLoading, setNickLoading] = useState(false);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    void googleAvatarUrl().then(setGoogleUrl);
  }, []);

  if (isLoading || !profile) return <BootingScreen />;
  const currentNick = `${profile.nickname_base ?? '—'}#${profile.nickname_discriminator ?? ''}`;

  const onChangeNick = async () => {
    setNickErr(null);
    setNickDone(false);
    setNickLoading(true);
    const res = await changeNickname(nick.trim());
    setNickLoading(false);
    if (res.ok) {
      setNick('');
      setNickDone(true);
      await qc.invalidateQueries({ queryKey: ['myProfile'] });
    } else {
      setNickErr(tr('settings.errors.' + (res.code ?? 'INTERNAL')));
    }
  };

  const pickAvatar = async (url: string, source: 'DEFAULT_SET' | 'GOOGLE_PHOTO') => {
    if (!userId) return;
    await setAvatar(userId, url, source);
    await qc.invalidateQueries({ queryKey: ['myProfile'] });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar url={profile.avatar_url} size={104} />
          <Txt variant="display" style={styles.nick}>{currentNick}</Txt>
          {!!email && <Txt variant="muted">{email}</Txt>}
        </View>

        {/* Avatar picker */}
        <Card>
          <Txt variant="muted" style={styles.label}>{dict.avatar.title}</Txt>
          <View style={styles.grid}>
            {avatarKeys.map((k) => (
              <Pressable key={k} onPress={() => pickAvatar(k, 'DEFAULT_SET')}>
                <View style={[styles.avatarWrap, profile.avatar_url === k && { borderColor: colors.primary }]}>
                  <Avatar url={k} size={48} />
                </View>
              </Pressable>
            ))}
          </View>
          {!!googleUrl && (
            <Button title={dict.avatar.google} variant="secondary" onPress={() => pickAvatar(googleUrl, 'GOOGLE_PHOTO')} />
          )}
          <Txt variant="small" style={styles.upload}>{dict.avatar.upload}</Txt>
        </Card>

        {/* Change nickname */}
        <Card>
          <TextField label={dict.nickname.label} value={nick} onChangeText={setNick} maxLength={20} error={nickErr ?? undefined} />
          {nickDone && <Txt color={colors.success} style={styles.done}>{dict.nickname.changed}</Txt>}
          <Button title={dict.nickname.change} onPress={onChangeNick} loading={nickLoading} disabled={!NICK_RE.test(nick.trim())} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  hero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  nick: { marginTop: 10, fontSize: 24 },
  label: { marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarWrap: { borderRadius: 28, borderWidth: 2, borderColor: 'transparent', padding: 2 },
  upload: { marginTop: 10 },
  done: { marginBottom: 8 },
});
