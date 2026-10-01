/**
 * Design tokens do ROOV — extraídos do Figma "Design ROOV Mobile App".
 *
 * Equivalente nativo do que no front web são CSS custom properties. Nenhum
 * componente deve escrever hex direto: sempre `colors.*` ou `categoryColor()`.
 */

export const colors = {
  background: '#050505',
  backgroundElevated: '#0B0B0D',
  foreground: '#F5F5F5',
  muted: '#B8B8B8',

  surface: 'rgba(255,255,255,0.05)',
  surfaceStrong: 'rgba(255,255,255,0.09)',
  surfaceHover: 'rgba(255,255,255,0.14)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.22)',

  favorito: '#FF0F7B',
  quero: '#FFC83D',
  vivido: '#22C55E',

  warning: '#FFB400',
  danger: '#FF0F7B',
};

/** Gradiente oficial da marca — usado no FAB, botões primários e no logo. */
export const gradient = {
  colors: ['#7B2DFF', '#FF0F7B', '#FF6A2A', '#FFB400'],
  locations: [0, 0.33, 0.66, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const text = {
  title: { fontSize: 22, fontWeight: '700', color: colors.foreground },
  heading: { fontSize: 17, fontWeight: '600', color: colors.foreground },
  body: { fontSize: 14, color: colors.foreground },
  small: { fontSize: 12, color: colors.muted },
  tiny: { fontSize: 11, color: colors.muted },
};

/** Superfície de vidro — o card padrão do app. */
export const glass = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.lg,
};

/** Aplica alpha a um hex de 6 dígitos. `alpha(0..1)` → '#RRGGBBAA'. */
export function withAlpha(hex, alpha) {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/** Ícone do Ionicons para cada categoria principal. */
export const CATEGORY_ICONS = {
  entretenimento: 'wine',
  gastronomia: 'restaurant',
  natureza: 'leaf',
  passeios: 'camera',
};

/** Ícone do Ionicons para cada classificação da biblioteca. */
export const LIBRARY_ICONS = {
  favorito: { on: 'heart', off: 'heart-outline' },
  quero: { on: 'star', off: 'star-outline' },
  vivido: { on: 'checkmark-circle', off: 'checkmark-circle-outline' },
};
