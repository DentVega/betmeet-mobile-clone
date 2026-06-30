/**
 * Active theme = deportivo brand, light/dark by device color scheme.
 * Returns the semantic color set + radius/spacing/typography tokens.
 */
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, radius, spacing, typography, type ThemeColors } from './tokens';

export interface Theme {
  colors: ThemeColors;
  dark: boolean;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { colors: dark ? darkColors : lightColors, dark, radius, spacing, typography };
}
