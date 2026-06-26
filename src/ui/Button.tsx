/**
 * Primary/secondary button with a loading state. Pressable + StyleSheet
 * (vercel-react-native-skills).
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}>
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={isPrimary ? '#ffffff' : '#111111'}
            style={styles.spinner}
          />
        )}
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16, marginTop: 8 },
  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  spinner: { marginRight: 8 },
  text: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  textPrimary: { color: '#ffffff' },
  textSecondary: { color: '#111111' },
});
