/**
 * Labeled text input + error line. For secure fields it renders a Show/Hide
 * toggle. Presentational; screens wire it to react-hook-form via Controller.
 */
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { t } from '../i18n';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({
  label,
  error,
  style,
  secureTextEntry,
  ...inputProps
}: TextFieldProps) {
  const isSecure = !!secureTextEntry;
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[styles.input, isSecure && styles.inputWithToggle, !!error && styles.inputError, style]}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          secureTextEntry={isSecure && !revealed}
          {...inputProps}
        />
        {isSecure && (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            style={styles.toggle}
            hitSlop={8}
            accessibilityRole="button">
            <Text style={styles.toggleText}>
              {revealed ? t().common.hide : t().common.show}
            </Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111111',
  },
  inputWithToggle: { paddingRight: 76 },
  inputError: { borderColor: '#dc2626' },
  toggle: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 12 },
  toggleText: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 4 },
});
