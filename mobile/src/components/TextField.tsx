import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  large?: boolean;
}

export default function TextField({ label, icon, large, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, large && styles.labelLarge]}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          large && styles.inputRowLarge,
          focused && styles.inputRowFocused,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={large ? 24 : 20}
            color={focused ? colors.primary : colors.textFaint}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, large && styles.inputLarge, style]}
          placeholderTextColor={colors.textFaint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  labelLarge: { fontSize: 16, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
  },
  inputRowLarge: { borderRadius: radii.lg, paddingHorizontal: 18 },
  inputRowFocused: { borderColor: colors.primary },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
  inputLarge: { paddingVertical: 18, fontSize: 20 },
});
