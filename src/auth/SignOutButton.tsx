/**
 * Sign out (US-A6). Ends the Supabase session; the secure-storage adapter clears
 * the tokens and onAuthStateChange returns the shell to the Auth stack.
 */
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { authService } from './authService';
import { t } from '../i18n';

export function SignOutButton() {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => {
        void authService.signOut();
      }}
      style={styles.button}>
      <Text style={styles.text}>{t().shell.signOut}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 12, paddingVertical: 4 },
  text: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
});
