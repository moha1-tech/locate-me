import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCircle } from '../../context/CircleContext';
import { acknowledgeAlert, listAlerts } from '../../api/alerts';
import { connectSocket, joinCircleRoom } from '../../services/socket';
import { AppAlert } from '../../types';
import { Button, Card, EmptyState } from '../../components';
import { colors, caregiverTypography, radii, spacing } from '../../theme';

const ALERT_META: Record<AppAlert['type'], { label: string; icon: keyof typeof Ionicons.glyphMap; tone: string }> = {
  SOS: { label: 'SOS pressed', icon: 'alert-circle', tone: colors.danger },
  GEOFENCE_EXIT: { label: 'Left a safe zone', icon: 'exit-outline', tone: colors.warning },
  LOW_BATTERY: { label: 'Low battery', icon: 'battery-dead-outline', tone: colors.warning },
  CONNECTIVITY_LOST: { label: 'Lost connectivity', icon: 'cloud-offline-outline', tone: colors.textMuted },
};

export default function AlertsScreen() {
  const { activeCircle } = useCircle();
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!activeCircle) return Promise.resolve();
    return listAlerts(activeCircle.id).then(setAlerts);
  }, [activeCircle?.id]);

  useEffect(() => {
    load();
    if (!activeCircle) return;
    connectSocket().then((socket) => {
      joinCircleRoom(activeCircle.id);
      socket.on('alert:new', (alert: AppAlert) => setAlerts((prev) => [alert, ...prev]));
    });
  }, [activeCircle?.id, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onAcknowledge = async (id: string) => {
    const updated = await acknowledgeAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  if (!activeCircle) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState icon="people-outline" title="No circle yet" message="No one has added you to their circle yet." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[styles.listContent, alerts.length === 0 && styles.listContentEmpty]}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="All quiet" message="You'll see SOS presses, safe-zone exits, and low-battery warnings here." />
        }
        renderItem={({ item }) => {
          const meta = ALERT_META[item.type];
          const isSos = item.type === 'SOS';
          return (
            <Card style={[styles.card, isSos && styles.cardSos]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: `${meta.tone}1A` }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.tone} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{meta.label}</Text>
                  <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                {item.acknowledgedAt && <Ionicons name="checkmark-done" size={18} color={colors.success} />}
              </View>
              <Text style={styles.cardMessage}>{item.message}</Text>
              {!item.acknowledgedAt && (
                <Button
                  label="Acknowledge"
                  size="default"
                  fullWidth={false}
                  style={styles.ackButton}
                  onPress={() => onAcknowledge(item.id)}
                />
              )}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  listContentEmpty: { flexGrow: 1, justifyContent: 'center' },
  card: { marginBottom: spacing.sm },
  cardSos: { borderColor: colors.danger, backgroundColor: colors.dangerSurface },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  cardHeaderText: { flex: 1, marginLeft: spacing.sm },
  cardTitle: { fontSize: caregiverTypography.title, fontWeight: '700', color: colors.text },
  cardTime: { fontSize: caregiverTypography.tiny, color: colors.textMuted, marginTop: 1 },
  cardMessage: { fontSize: caregiverTypography.body, color: colors.text, marginTop: spacing.sm },
  ackButton: { marginTop: spacing.sm },
});
