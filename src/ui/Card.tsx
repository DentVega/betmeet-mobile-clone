/** Themed surface card. */
import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 16 },
        style,
      ]}>
      {children}
    </View>
  );
}
