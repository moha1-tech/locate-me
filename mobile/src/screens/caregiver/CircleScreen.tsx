import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCircle } from '../../context/CircleContext';
import { useAuth } from '../../context/AuthContext';
import { inviteCaregiver } from '../../api/circles';
import { Avatar, Button, Card, EmptyState, StatusPill, TextField } from '../../components';
import { colors, caregiverTypography, spacing } from '../../theme';

export default function CircleScreen() {
  const { activeCircle, pendingInvites, refetch, accept } = useCircle();
  const { user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const onAccept = async (circleId: string, patientName: string) => {
    setAcceptingId(circleId);
    try {
      await accept(circleId);
      Alert.alert('Connected', `You're now watching over ${patientName}.`);
    } catch (err: any) {
      Alert.alert('Could not accept', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const onInvite = async () => {
    if (!email.trim() || !activeCircle) return;
    setSending(true);
    try {
      await inviteCaregiver(activeCircle.id, email.trim().toLowerCase());
      Alert.alert('Invite sent', `${email} can now accept once they've created an account.`);
      setEmail('');
      await refetch();
    } catch (err: any) {
      Alert.alert('Could not invite', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        data={activeCircle?.members ?? []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {pendingInvites.length > 0 && (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Invites waiting for you</Text>
                {pendingInvites.map((invite, index) => (
                  <View key={invite.circleId} style={[styles.inviteRow, index === 0 && styles.inviteRowFirst]}>
                    <Avatar name={invite.patient.name} size={40} />
                    <Text style={styles.memberName}>{invite.patient.name}</Text>
                    <Button
                      label={acceptingId === invite.circleId ? 'Accepting…' : 'Accept'}
                      onPress={() => onAccept(invite.circleId, invite.patient.name)}
                      disabled={acceptingId === invite.circleId}
                      loading={acceptingId === invite.circleId}
                      fullWidth={false}
                      style={styles.acceptButton}
                    />
                  </View>
                ))}
              </Card>
            )}

            {activeCircle && (
              <Card style={styles.patientCard}>
                <Avatar name={activeCircle?.patient?.name ?? '?'} size={56} />
                <View style={{ marginLeft: spacing.md }}>
                  <Text style={styles.sectionTitle}>Watching over</Text>
                  <Text style={styles.patientName}>{activeCircle?.patient?.name ?? 'No one yet'}</Text>
                </View>
              </Card>
            )}

            {activeCircle && (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Invite another caregiver</Text>
                <Text style={styles.hint}>They must already have a LocateMe account (as a caregiver) to be invited.</Text>
                <TextField
                  icon="mail-outline"
                  placeholder="Their email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <Button label={sending ? 'Sending…' : 'Send invite'} onPress={onInvite} disabled={sending} loading={sending} />
              </Card>
            )}

            {activeCircle && (activeCircle.members?.length ?? 0) > 0 && (
              <Text style={styles.membersHeader}>Circle members</Text>
            )}
          </>
        }
        ListEmptyComponent={
          activeCircle || pendingInvites.length > 0 ? null : (
            <EmptyState icon="people-outline" title="No circle yet" message="No one has added you to their circle yet." />
          )
        }
        renderItem={({ item }) => (
          <Card style={styles.memberCard}>
            <Avatar name={item.caregiver.name} size={40} />
            <Text style={styles.memberName}>{item.caregiver.name}</Text>
            <StatusPill
              label={item.permission === 'ADMIN' ? 'Admin' : 'View only'}
              tone={item.permission === 'ADMIN' ? 'primary' : 'neutral'}
            />
            <StatusPill
              label={item.status === 'ACCEPTED' ? 'Accepted' : 'Pending'}
              tone={item.status === 'ACCEPTED' ? 'success' : 'warning'}
            />
          </Card>
        )}
        ListFooterComponent={
          <Button label={`Log out (${user?.email})`} variant="ghost" icon="log-out-outline" onPress={logout} style={styles.logoutButton} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  patientCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  card: { marginBottom: spacing.md },
  sectionTitle: { fontSize: caregiverTypography.small, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  patientName: { fontSize: caregiverTypography.title, fontWeight: '800', color: colors.text, marginTop: 4 },
  hint: { fontSize: caregiverTypography.small, color: colors.textMuted, marginVertical: spacing.sm },
  membersHeader: {
    fontSize: caregiverTypography.small,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  memberName: { flex: 1, fontSize: caregiverTypography.body, color: colors.text, fontWeight: '600' },
  logoutButton: { marginTop: spacing.md, alignSelf: 'center' },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inviteRowFirst: { borderTopWidth: 0, paddingTop: spacing.sm },
  acceptButton: { paddingHorizontal: spacing.md },
});
