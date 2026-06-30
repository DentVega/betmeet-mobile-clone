import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { fonts } from '../../theme/tokens';

/** Themed shared styles for the auth screens. */
export function useAuthStyles() {
  const { colors } = useTheme();
  return StyleSheet.create({
    content: { padding: 24, flexGrow: 1, justifyContent: 'center' },
    title: {
      fontSize: 30,
      fontFamily: fonts.display,
      letterSpacing: -0.3,
      color: colors.foreground,
      marginBottom: 24,
      textAlign: 'center',
    },
    serverError: { color: colors.destructive, fontSize: 14, marginBottom: 8, textAlign: 'center' },
    info: { fontSize: 15, color: colors.mutedForeground, textAlign: 'center', marginBottom: 16 },
    success: { fontSize: 15, color: colors.success, textAlign: 'center', marginBottom: 16 },
    link: { color: colors.primary, fontSize: 15, textAlign: 'center', marginTop: 16 },
  });
}
