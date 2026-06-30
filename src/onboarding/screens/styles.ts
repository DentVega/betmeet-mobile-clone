import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';

/** Themed shared styles for the onboarding wizard. */
export function useObStyles() {
  const { colors } = useTheme();
  return StyleSheet.create({
    content: { padding: 24, flexGrow: 1 },
    title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, color: colors.foreground, marginBottom: 16 },
    help: { fontSize: 14, color: colors.mutedForeground, marginBottom: 16 },
    body: { fontSize: 16, color: colors.foreground, lineHeight: 24, marginBottom: 24 },
    assigned: { fontSize: 16, color: colors.success, fontWeight: '600', marginBottom: 16 },
    error: { color: colors.destructive, fontSize: 14, marginBottom: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
    avatarWrap: { borderRadius: 40, borderWidth: 3, borderColor: 'transparent', padding: 2 },
    avatarSelected: { borderColor: colors.primary },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.muted },
  });
}
