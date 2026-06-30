/** Themed labeled input + error line + Show/Hide toggle for secure fields. */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { t } from '../i18n';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, secureTextEntry, ...inputProps }: TextFieldProps) {
  const { colors, radius } = useTheme();
  const isSecure = !!secureTextEntry;
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View>
        <TextInput
          style={[
            styles.input,
            { borderColor: error ? colors.destructive : colors.input, color: colors.foreground, borderRadius: radius.md, backgroundColor: colors.card },
            isSecure && styles.inputWithToggle,
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          secureTextEntry={isSecure && !revealed}
          {...inputProps}
        />
        {isSecure && (
          <Pressable onPress={() => setRevealed((r) => !r)} style={styles.toggle} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {revealed ? t().common.hide : t().common.show}
            </Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16 },
  inputWithToggle: { paddingRight: 76 },
  toggle: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 12 },
  toggleText: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 13, marginTop: 4 },
});
