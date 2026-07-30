export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  primarySurface: '#EFF6FF',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',

  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  danger: '#DC2626',
  dangerSurface: '#FEF2F2',
  dangerDark: '#B91C1C',

  success: '#16A34A',
  successSurface: '#F0FDF4',

  warning: '#D97706',
  warningSurface: '#FFFBEB',

  overlay: 'rgba(15, 23, 42, 0.55)',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/** Font sizes are intentionally large throughout the patient-facing screens for readability. */
export const patientTypography = {
  title: 32,
  subtitle: 20,
  body: 22,
  button: 26,
};

export const caregiverTypography = {
  display: 28,
  title: 20,
  body: 15,
  small: 13,
  tiny: 11,
};
