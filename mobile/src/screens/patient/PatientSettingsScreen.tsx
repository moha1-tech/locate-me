import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getMyCircle, inviteCaregiver } from '../../api/circles';
import { Circle } from '../../types';
import { Avatar, Button, Card, StatusPill, TextField } from '../../components';
import { colors, patientTypography, radii, spacing } from '../../theme';

/**
 * Inviting caregivers lives here (not on the caregiver side) because a fresh circle has zero
 * caregivers — only the patient can bootstrap the first one. Once at least one ADMIN caregiver
 * has accepted, they can invite additional caregivers from their own Circle tab.
 */
export default function PatientSettingsScreen() {
  const { user, logout } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const loadCircle = () => getMyCircle().then(setCircle);

  useEffect(() => {
    loadCircle();
  }, []);

  const onInvite = async () => {
    if (!email.trim() || !circle) return;
    setSending(true);
    try {
      await inviteCaregiver(circle.id, email.trim().toLowerCase(), 'ADMIN');
      Alert.alert('Invite sent', `${email} can accept once they've created a caregiver account.`);
      setEmail('');
      await loadCircle();
    } catch (err: any) {
      Alert.alert('Could not invite', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Avatar name={user?.name ?? '?'} size={72} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Invite a caregiver</Text>
          <TextField
            large
            icon="mail-outline"
            placeholder="Their email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Button label={sending ? 'Sending…' : 'Send invite'} onPress={onInvite} disabled={sending} loading={sending} />
        </Card>

        {circle && circle.members.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Watching over you</Text>
            {circle.members.map((m, index) => (
              <View key={m.id} style={[styles.memberRow, index === 0 && styles.memberRowFirst]}>
                <Avatar name={m.caregiver.name} size={40} />
                <Text style={styles.memberName}>{m.caregiver.name}</Text>
                <StatusPill
                  label={m.status === 'ACCEPTED' ? 'Accepted' : 'Pending'}
                  tone={m.status === 'ACCEPTED' ? 'success' : 'warning'}
                />
              </View>
            ))}
          </Card>
        )}

        <Button
          label="Log out"
          variant="ghost"
          icon="log-out-outline"
          onPress={logout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg },
  profileHeader: { alignItems: 'center', marginBottom: spacing.lg },
  name: { fontSize: patientTypography.title, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  email: { fontSize: 16, color: colors.textMuted, marginTop: 2 },
  card: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  memberRowFirst: { borderTopWidth: 0, paddingTop: 0 },
  memberName: { flex: 1, fontSize: patientTypography.body, color: colors.text, fontWeight: '500' },
  logoutButton: { marginTop: spacing.md, alignSelf: 'center' },
});
