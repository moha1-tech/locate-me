import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'default' | 'large' | 'giant';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const SIZE_STYLES: Record<Size, { paddingVertical: number; fontSize: number; iconSize: number }> = {
  default: { paddingVertical: 14, fontSize: 16, iconSize: 18 },
  large: { paddingVertical: 18, fontSize: 20, iconSize: 22 },
  giant: { paddingVertical: 22, fontSize: 24, iconSize: 26 },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizeStyle = SIZE_STYLES[size];
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        { paddingVertical: sizeStyle.paddingVertical },
        variantStyle.container,
        !fullWidth && styles.inline,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color as string} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={sizeStyle.iconSize}
              color={variantStyle.text.color as string}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, { fontSize: sizeStyle.fontSize }, variantStyle.text]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const VARIANT_STYLES: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary, ...shadows.sm },
    text: { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
    text: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.danger, ...shadows.sm },
    text: { color: colors.white },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.textMuted },
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  inline: { alignSelf: 'flex-start' },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  label: { fontWeight: '700' },
});
