/** Themed typographic helpers (display/heading/body/muted). */
import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Variant = 'display' | 'heading' | 'title' | 'body' | 'muted' | 'small';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  style?: TextStyle;
}

export function Txt({ variant = 'body', color, style, ...rest }: Props) {
  const { colors, typography } = useTheme();
  const v: TextStyle = (() => {
    switch (variant) {
      case 'display':
        return { fontSize: typography.sizes.display, ...typography.display, color: colors.foreground };
      case 'heading':
        return { fontSize: typography.sizes.xxl, ...typography.heading, color: colors.foreground };
      case 'title':
        return { fontSize: typography.sizes.lg, ...typography.semibold, color: colors.foreground };
      case 'muted':
        return { fontSize: typography.sizes.sm, color: colors.mutedForeground };
      case 'small':
        return { fontSize: typography.sizes.xs, color: colors.mutedForeground };
      default:
        return { fontSize: typography.sizes.base, color: colors.foreground };
    }
  })();
  return <RNText {...rest} style={[v, color ? { color } : null, style]} />;
}
