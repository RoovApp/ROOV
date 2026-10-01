export const RoovColors = {
  primary: '#6C3CE1',
  primaryDark: '#5429C7',
  accent: '#FF6B4A',
  background: '#0F0F12',
  surface: '#1A1A22',
  surfaceElevated: '#24242E',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  border: '#2E2E3A',
  success: '#34D399',
  warning: '#FBBF24',
  categories: {
    gastro: '#FF6B4A',
    natureza: '#34D399',
    passeios: '#60A5FA',
    noturna: '#A78BFA',
  },
} as const;

export default {
  light: {
    text: RoovColors.text,
    background: RoovColors.background,
    tint: RoovColors.primary,
    tabIconDefault: RoovColors.textSecondary,
    tabIconSelected: RoovColors.primary,
  },
  dark: {
    text: RoovColors.text,
    background: RoovColors.background,
    tint: RoovColors.primary,
    tabIconDefault: RoovColors.textSecondary,
    tabIconSelected: RoovColors.primary,
  },
};
