import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
}

export default function Card({ style, padded = true, elevated = true, children, ...rest }: CardProps) {
  return (
    <View
      style={[styles.base, padded && styles.padded, elevated && shadows.sm, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: spacing.md },
});
