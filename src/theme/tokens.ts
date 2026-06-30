/**
 * Design tokens ported from betmeet-clone `globals.css` — brand "deportivo"
 * (default), light + dark. Hex values verbatim from the web (RN supports
 * #RRGGBBAA, so the dark border/input alphas carry over). Components consume the
 * semantic names via useTheme(); switching scheme only swaps the value object.
 */
export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  brand: string;
  brandForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  live: string;
  liveForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export const lightColors: ThemeColors = {
  background: '#fafaf7',
  foreground: '#0b1220',
  card: '#ffffff',
  cardForeground: '#0b1220',
  primary: '#0f9e58',
  primaryForeground: '#ffffff',
  secondary: '#eef2ec',
  secondaryForeground: '#0b1220',
  muted: '#f1f3ef',
  mutedForeground: '#566052',
  accent: '#e8f1ea',
  accentForeground: '#0b1220',
  brand: '#f5a524',
  brandForeground: '#2a1b06',
  success: '#0f9e58',
  successForeground: '#ffffff',
  warning: '#f5a524',
  warningForeground: '#2a1b06',
  live: '#ef4444',
  liveForeground: '#ffffff',
  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
  border: '#e2e7dd',
  input: '#e2e7dd',
  ring: '#0f9e58',
};

export const darkColors: ThemeColors = {
  background: '#0a0f1a',
  foreground: '#f3f5f2',
  card: '#111827',
  cardForeground: '#f3f5f2',
  primary: '#1dbe74',
  primaryForeground: '#05140b',
  secondary: '#1b2433',
  secondaryForeground: '#f3f5f2',
  muted: '#161f2c',
  mutedForeground: '#9aa7b2',
  accent: '#1b2433',
  accentForeground: '#f3f5f2',
  brand: '#fbbf24',
  brandForeground: '#20160a',
  success: '#1dbe74',
  successForeground: '#05140b',
  warning: '#fbbf24',
  warningForeground: '#20160a',
  live: '#fb5252',
  liveForeground: '#1a0606',
  destructive: '#f87171',
  destructiveForeground: '#1a0606',
  border: '#ffffff14',
  input: '#ffffff1f',
  ring: '#1dbe74',
};

// --radius: 0.625rem = 10px; sm/md/lg/xl mirror the web calc().
export const radius = { sm: 6, md: 8, lg: 10, xl: 14, full: 9999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// font-display (Barlow Semi Condensed) / font-sans (Geist) not yet embedded —
// system fallback with the web's weight/spacing intent. Embedding is a follow-up.
export const typography = {
  display: { fontWeight: '800' as const, letterSpacing: -0.3 },
  heading: { fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontWeight: '400' as const },
  semibold: { fontWeight: '600' as const },
  sizes: { xs: 12, sm: 13, base: 15, md: 16, lg: 18, xl: 22, xxl: 28, display: 34 },
} as const;
