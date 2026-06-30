/**
 * Design tokens ported from betmeet-clone `globals.css` — all 3 brand themes
 * (deportivo default | moderno | premium) × light/dark. Hex verbatim from the
 * web (RN supports #RRGGBBAA). Consumed via useTheme() (brand from brandStore,
 * scheme from the device).
 */
export interface ThemeColors {
  background: string; foreground: string;
  card: string; cardForeground: string;
  primary: string; primaryForeground: string;
  secondary: string; secondaryForeground: string;
  muted: string; mutedForeground: string;
  accent: string; accentForeground: string;
  brand: string; brandForeground: string;
  success: string; successForeground: string;
  warning: string; warningForeground: string;
  live: string; liveForeground: string;
  destructive: string; destructiveForeground: string;
  border: string; input: string; ring: string;
}

export type Brand = 'deportivo' | 'moderno' | 'premium';
export const BRANDS: Brand[] = ['deportivo', 'moderno', 'premium'];

const deportivoLight: ThemeColors = {
  background: '#fafaf7', foreground: '#0b1220', card: '#ffffff', cardForeground: '#0b1220',
  primary: '#0f9e58', primaryForeground: '#ffffff', secondary: '#eef2ec', secondaryForeground: '#0b1220',
  muted: '#f1f3ef', mutedForeground: '#566052', accent: '#e8f1ea', accentForeground: '#0b1220',
  brand: '#f5a524', brandForeground: '#2a1b06', success: '#0f9e58', successForeground: '#ffffff',
  warning: '#f5a524', warningForeground: '#2a1b06', live: '#ef4444', liveForeground: '#ffffff',
  destructive: '#dc2626', destructiveForeground: '#ffffff', border: '#e2e7dd', input: '#e2e7dd', ring: '#0f9e58',
};
const deportivoDark: ThemeColors = {
  background: '#0a0f1a', foreground: '#f3f5f2', card: '#111827', cardForeground: '#f3f5f2',
  primary: '#1dbe74', primaryForeground: '#05140b', secondary: '#1b2433', secondaryForeground: '#f3f5f2',
  muted: '#161f2c', mutedForeground: '#9aa7b2', accent: '#1b2433', accentForeground: '#f3f5f2',
  brand: '#fbbf24', brandForeground: '#20160a', success: '#1dbe74', successForeground: '#05140b',
  warning: '#fbbf24', warningForeground: '#20160a', live: '#fb5252', liveForeground: '#1a0606',
  destructive: '#f87171', destructiveForeground: '#1a0606', border: '#ffffff14', input: '#ffffff1f', ring: '#1dbe74',
};

const modernoLight: ThemeColors = {
  background: '#ffffff', foreground: '#0a0a0a', card: '#ffffff', cardForeground: '#0a0a0a',
  primary: '#4f46e5', primaryForeground: '#ffffff', secondary: '#f4f4f5', secondaryForeground: '#18181b',
  muted: '#f4f4f5', mutedForeground: '#71717a', accent: '#f4f4f5', accentForeground: '#18181b',
  brand: '#4f46e5', brandForeground: '#ffffff', success: '#16a34a', successForeground: '#ffffff',
  warning: '#d97706', warningForeground: '#ffffff', live: '#dc2626', liveForeground: '#ffffff',
  destructive: '#dc2626', destructiveForeground: '#ffffff', border: '#e4e4e7', input: '#e4e4e7', ring: '#4f46e5',
};
const modernoDark: ThemeColors = {
  background: '#0a0a0b', foreground: '#fafafa', card: '#141416', cardForeground: '#fafafa',
  primary: '#818cf8', primaryForeground: '#0a0a0b', secondary: '#1f1f23', secondaryForeground: '#fafafa',
  muted: '#1a1a1e', mutedForeground: '#a1a1aa', accent: '#1f1f23', accentForeground: '#fafafa',
  brand: '#818cf8', brandForeground: '#0a0a0b', success: '#4ade80', successForeground: '#0a0a0b',
  warning: '#fbbf24', warningForeground: '#0a0a0b', live: '#f87171', liveForeground: '#1a0606',
  destructive: '#f87171', destructiveForeground: '#1a0606', border: '#ffffff14', input: '#ffffff1f', ring: '#818cf8',
};

const premiumLight: ThemeColors = {
  background: '#fbfafc', foreground: '#14101a', card: '#ffffff', cardForeground: '#14101a',
  primary: '#7c3aed', primaryForeground: '#ffffff', secondary: '#f3eff9', secondaryForeground: '#14101a',
  muted: '#f3f0f7', mutedForeground: '#6b6478', accent: '#f3eff9', accentForeground: '#14101a',
  brand: '#d4af37', brandForeground: '#1a1505', success: '#15a34a', successForeground: '#ffffff',
  warning: '#d4af37', warningForeground: '#1a1505', live: '#e11d48', liveForeground: '#ffffff',
  destructive: '#e11d48', destructiveForeground: '#ffffff', border: '#e9e3f1', input: '#e9e3f1', ring: '#7c3aed',
};
const premiumDark: ThemeColors = {
  background: '#0b0710', foreground: '#f5f2fa', card: '#15101d', cardForeground: '#f5f2fa',
  primary: '#a78bfa', primaryForeground: '#0b0710', secondary: '#1e1729', secondaryForeground: '#f5f2fa',
  muted: '#181221', mutedForeground: '#a99fb8', accent: '#1e1729', accentForeground: '#f5f2fa',
  brand: '#e6c254', brandForeground: '#1a1505', success: '#4ade80', successForeground: '#07140b',
  warning: '#e6c254', warningForeground: '#1a1505', live: '#fb7185', liveForeground: '#1a0608',
  destructive: '#fb7185', destructiveForeground: '#1a0608', border: '#ffffff14', input: '#ffffff1f', ring: '#a78bfa',
};

export const themes: Record<Brand, { light: ThemeColors; dark: ThemeColors }> = {
  deportivo: { light: deportivoLight, dark: deportivoDark },
  moderno: { light: modernoLight, dark: modernoDark },
  premium: { light: premiumLight, dark: premiumDark },
};

export const radius = { sm: 6, md: 8, lg: 10, xl: 14, full: 9999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const fonts = {
  display: 'BarlowSemiCondensed-ExtraBold',
  displayBold: 'BarlowSemiCondensed-Bold',
  displaySemibold: 'BarlowSemiCondensed-SemiBold',
  sans: 'Geist-Regular',
  sansMedium: 'Geist-Medium',
  sansSemibold: 'Geist-SemiBold',
  sansBold: 'Geist-Bold',
} as const;

export const typography = {
  display: { fontWeight: '800' as const, letterSpacing: -0.3 },
  heading: { fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontWeight: '400' as const },
  semibold: { fontWeight: '600' as const },
  sizes: { xs: 12, sm: 13, base: 15, md: 16, lg: 18, xl: 22, xxl: 28, display: 34 },
} as const;
