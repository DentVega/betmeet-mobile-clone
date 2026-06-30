/** Themed button: primary / secondary / destructive, with loading state. */
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { fonts } from '../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false }: ButtonProps) {
  const { colors, radius } = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary' ? colors.primary : variant === 'destructive' ? colors.destructive : colors.secondary;
  const fg =
    variant === 'primary'
      ? colors.primaryForeground
      : variant === 'destructive'
        ? colors.destructiveForeground
        : colors.secondaryForeground;
  const border = variant === 'secondary' ? colors.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor: border, borderRadius: radius.lg },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}>
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" color={fg} style={styles.spinner} />}
        <Text style={[styles.text, { color: fg }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16, marginTop: 8 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  spinner: { marginRight: 8 },
  text: { fontSize: 16, fontFamily: fonts.sansSemibold, textAlign: 'center', letterSpacing: -0.2 },
});
