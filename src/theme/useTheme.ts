/** Active theme = selected brand × device light/dark. */
import { useColorScheme } from 'react-native';
import { themes, radius, spacing, typography, type ThemeColors, type Brand } from './tokens';
import { useBrandStore } from './brandStore';

export interface Theme {
  colors: ThemeColors;
  dark: boolean;
  brand: Brand;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const brand = useBrandStore((s) => s.brand);
  return { colors: themes[brand][dark ? 'dark' : 'light'], dark, brand, radius, spacing, typography };
}
