export const colors = {
  primary: '#6C8EBF',
  primaryDark: '#4A6FA5',
  primaryLight: '#A8C1E0',
  background: '#F0F4FF',
  surface: '#FFFFFF',
  text: '#2D3748',
  textSecondary: '#718096',
  textMuted: '#A0AEC0',
  accent: '#8FB8AD',
  accentLight: '#C4DDD8',
  error: '#E07070',
  errorLight: '#FDECEA',
  border: '#E2E8F0',
  inputBackground: '#F7F9FC',
  white: '#FFFFFF',
  overlay: 'rgba(45, 55, 72, 0.4)',
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#6C8EBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6C8EBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C8EBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

const theme = { colors, typography, spacing, borderRadius, shadows };

export default theme;
