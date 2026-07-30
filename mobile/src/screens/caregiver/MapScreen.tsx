import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import MapView, { Circle as MapCircle, Marker } from 'react-native-maps';
import { useCircle } from '../../context/CircleContext';
import { getLatestLocation } from '../../api/locations';
import { listGeofences } from '../../api/geofences';
import { connectSocket, joinCircleRoom } from '../../services/socket';
import { Circle, Geofence, LocationPing } from '../../types';
import { Avatar, EmptyState, StatusPill } from '../../components';
import { colors, radii, shadows, spacing } from '../../theme';

/**
 * Android's MapView hard-crashes at the native layer (not a catchable JS error) if no Google
 * Maps API key is configured, so we must check before ever mounting it rather than try/catch.
 * iOS uses Apple Maps for free and needs no key.
 */
const HAS_MAPS_KEY =
  Platform.OS === 'ios' || Boolean(Constants.expoConfig?.android?.config?.googleMaps?.apiKey);

export default function MapScreen() {
  const { activeCircle } = useCircle();
  const [location, setLocation] = useState<LocationPing | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  useEffect(() => {
    if (!activeCircle) {
      return;
    }
    let cancelled = false;

    getLatestLocation(activeCircle.id).then((loc) => !cancelled && setLocation(loc));
    listGeofences(activeCircle.id).then((gf) => !cancelled && setGeofences(gf));

    connectSocket().then((socket) => {
      joinCircleRoom(activeCircle.id);
      socket.on('location:update', (payload: LocationPing) => {
        if (!cancelled) {
          setLocation(payload);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeCircle?.id]);

  if (!activeCircle) {
    return (
      <SafeAreaView style={styles.center}>
        <EmptyState
          icon="people-outline"
          title="No one to watch over yet"
          message="Once you accept an invite from someone's circle, you'll see their location here."
        />
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.center}>
        <EmptyState
          icon="location-outline"
          title="Waiting for a location update"
          message={`${activeCircle.patient?.name ?? 'They'}'s phone hasn't sent one yet.`}
        />
      </SafeAreaView>
    );
  }

  if (!HAS_MAPS_KEY) {
    return (
      <View style={styles.container}>
        <View style={styles.mapUnavailable}>
          <EmptyState
            icon="map-outline"
            title="Map isn't set up yet"
            message="This app needs a Google Maps API key to show the map. Location and alerts still work normally in the meantime."
          />
        </View>
        <SafeAreaView style={styles.overlaySafeArea} pointerEvents="box-none">
          <StatusCard activeCircle={activeCircle} location={location} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title={activeCircle.patient?.name ?? 'Patient'}
          description={`Last updated ${new Date(location.recordedAt).toLocaleTimeString()}`}
        />
        {geofences.map((g) => (
          <MapCircle
            key={g.id}
            center={{ latitude: g.centerLat, longitude: g.centerLng }}
            radius={g.radiusMeters}
            strokeColor={colors.primary}
            fillColor="rgba(37,99,235,0.12)"
          />
        ))}
      </MapView>

      <SafeAreaView style={styles.overlaySafeArea} pointerEvents="box-none">
        <StatusCard activeCircle={activeCircle} location={location} />
      </SafeAreaView>
    </View>
  );
}

function StatusCard({ activeCircle, location }: { activeCircle: Circle; location: LocationPing }) {
  const battery = location.batteryLevel;
  const batteryTone = battery == null ? 'neutral' : battery <= 15 ? 'danger' : battery <= 40 ? 'warning' : 'success';

  return (
    <View style={styles.statusCard}>
      <Avatar name={activeCircle.patient?.name ?? '?'} size={48} />
      <View style={styles.statusText}>
        <Text style={styles.patientName}>{activeCircle.patient?.name ?? 'Patient'}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{new Date(location.recordedAt).toLocaleTimeString()}</Text>
        </View>
      </View>
      <StatusPill
        label={battery != null ? `${battery}%` : '—'}
        tone={batteryTone as 'success' | 'warning' | 'danger' | 'neutral'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  mapUnavailable: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  center: { flex: 1, backgroundColor: colors.background },
  overlaySafeArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
    ...shadows.md,
  },
  statusText: { flex: 1, marginLeft: spacing.sm },
  patientName: { fontSize: 16, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
});
