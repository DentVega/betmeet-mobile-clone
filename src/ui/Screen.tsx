/**
 * Shared shell primitives. Functional + StyleSheet (vercel-react-native-skills).
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
}

export function Screen({ children }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      {children}
    </View>
  );
}

export function BootingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
    </View>
  );
}

/** Stand-in for screens delivered by later bolts. */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <Screen>
      <View style={styles.centered}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600', color: '#111111', textAlign: 'center' },
});
