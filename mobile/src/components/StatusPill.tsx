import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: colors.successSurface, fg: colors.success },
  warning: { bg: colors.warningSurface, fg: colors.warning },
  danger: { bg: colors.dangerSurface, fg: colors.danger },
  neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
  primary: { bg: colors.primarySurface, fg: colors.primary },
};

export default function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = TONE_STYLES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <View style={[styles.dot, { backgroundColor: t.fg }]} />
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
});
