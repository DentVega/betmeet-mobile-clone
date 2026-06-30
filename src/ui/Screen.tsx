/** Themed shell primitives. */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

export function Screen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      {children}
    </View>
  );
}

export function BootingScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function PlaceholderScreen({ title }: { title: string }) {
  const { colors, typography } = useTheme();
  return (
    <Screen>
      <View style={styles.centered}>
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: '600', color: colors.foreground, textAlign: 'center' }}>
          {title}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
