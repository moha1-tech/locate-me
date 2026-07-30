import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCircle } from '../../context/CircleContext';
import { createGeofence, deleteGeofence, listGeofences } from '../../api/geofences';
import { Geofence } from '../../types';
import { Button, Card, EmptyState, TextField } from '../../components';
import { colors, caregiverTypography, radii, spacing } from '../../theme';

export default function GeofencesScreen() {
  const { activeCircle } = useCircle();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [name, setName] = useState('');
  const [radius, setRadius] = useState('150');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (activeCircle) {
      listGeofences(activeCircle.id).then(setGeofences);
    }
  };

  useEffect(load, [activeCircle?.id]);

  const onAddAtCurrentLocation = async () => {
    if (!activeCircle || !name.trim()) {
      Alert.alert('Name required', 'Give this safe zone a name first, e.g. "Home".');
      return;
    }
    setSaving(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission needed', 'Allow location access to set a zone around where you are now.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      await createGeofence(activeCircle.id, {
        name: name.trim(),
        centerLat: current.coords.latitude,
        centerLng: current.coords.longitude,
        radiusMeters: Number(radius) || 150,
      });
      setName('');
      load();
    } catch (err: any) {
      Alert.alert('Could not create zone', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (geofenceId: string) => {
    if (!activeCircle) return;
    Alert.alert('Remove safe zone?', 'You will stop getting alerts for this zone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteGeofence(activeCircle.id, geofenceId).then(load),
      },
    ]);
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
        data={geofences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Card style={styles.form}>
            <Text style={styles.formLabel}>Add a safe zone at your current location</Text>
            <TextField icon="pricetag-outline" placeholder="Zone name (e.g. Home)" value={name} onChangeText={setName} />
            <TextField
              icon="resize-outline"
              placeholder="Radius in meters"
              keyboardType="numeric"
              value={radius}
              onChangeText={setRadius}
            />
            <Button
              label={saving ? 'Adding…' : 'Add zone here'}
              icon="add-circle-outline"
              onPress={onAddAtCurrentLocation}
              disabled={saving}
              loading={saving}
            />
          </Card>
        }
        ListEmptyComponent={
          <EmptyState icon="shield-outline" title="No safe zones yet" message="Add one above to get alerted if they leave it." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.radiusMeters}m radius</Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  form: { marginBottom: spacing.md },
  formLabel: { fontSize: caregiverTypography.body, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: caregiverTypography.body, fontWeight: '700', color: colors.text },
  cardSubtitle: { fontSize: caregiverTypography.small, color: colors.textMuted, marginTop: 2 },
});
