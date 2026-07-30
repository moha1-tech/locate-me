import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Button, TextField } from '../../components';
import { colors, radii, spacing } from '../../theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CAREGIVER');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await register(email.trim().toLowerCase(), password, name.trim(), role);
    } catch (err: any) {
      Alert.alert('Could not create account', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Tell us who you are, so we can set things up right.</Text>

          <Text style={styles.label}>I am registering as</Text>
          <View style={styles.roleRow}>
            <RoleCard
              icon="people-outline"
              label="A caregiver"
              active={role === 'CAREGIVER'}
              onPress={() => setRole('CAREGIVER')}
            />
            <RoleCard
              icon="person-outline"
              label="The person being cared for"
              active={role === 'PATIENT'}
              onPress={() => setRole('PATIENT')}
            />
          </View>

          <TextField label="Full name" icon="person-outline" placeholder="Jane Doe" value={name} onChangeText={setName} />
          <TextField
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            placeholder="At least 8 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            label={submitting ? 'Creating…' : 'Create account'}
            onPress={onSubmit}
            disabled={submitting}
            loading={submitting}
            size="large"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RoleCard({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, active && styles.roleCardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={22} color={active ? colors.white : colors.primary} />
      <Text style={[styles.roleCardText, active && styles.roleCardTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 6, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  roleRow: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  roleCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleCardText: { color: colors.text, fontWeight: '600', fontSize: 13, textAlign: 'center', marginTop: 8 },
  roleCardTextActive: { color: colors.white },
  submitButton: { marginTop: spacing.sm },
});
