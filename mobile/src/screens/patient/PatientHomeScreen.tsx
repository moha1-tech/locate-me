import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { triggerSos } from '../../api/alerts';
import {
  requestLocationPermissions,
  sendOneOffPing,
  startBackgroundTracking,
} from '../../services/locationTracking';
import { colors, patientTypography, radii, spacing } from '../../theme';

export default function PatientHomeScreen() {
  const [sharing, setSharing] = useState(false);
  const [sendingSos, setSendingSos] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Getting ready…');

  useEffect(() => {
    (async () => {
      const { granted, background } = await requestLocationPermissions();
      if (!granted) {
        setStatusMessage('Location permission is needed so caregivers can find you.');
        return;
      }
      await sendOneOffPing().catch(() => undefined);
      if (background) {
        await startBackgroundTracking();
        setSharing(true);
        setStatusMessage('Your caregivers can see where you are.');
      } else {
        setSharing(false);
        setStatusMessage('Keep the app open sometimes so caregivers can see where you are.');
      }
    })();

    return () => {
      // Intentionally not stopping tracking on unmount: this screen only unmounts on logout,
      // and background tracking should keep running whenever the app is backgrounded.
    };
  }, []);

  const handleSos = async () => {
    setSendingSos(true);
    try {
      const location = await Location.getCurrentPositionAsync({}).catch(() => null);
      await triggerSos(location?.coords.latitude, location?.coords.longitude);
      Alert.alert('Help is on the way', 'Your caregivers have been notified.');
    } catch {
      Alert.alert('Could not send SOS', 'Check your internet connection and try again.');
    } finally {
      setSendingSos(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusCard}>
        <View style={[styles.statusIcon, { backgroundColor: sharing ? colors.successSurface : colors.warningSurface }]}>
          <Ionicons
            name={sharing ? 'checkmark-circle' : 'time-outline'}
            size={22}
            color={sharing ? colors.success : colors.warning}
          />
        </View>
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      <View style={styles.sosArea}>
        <View style={styles.sosRing}>
          <TouchableOpacity
            style={[styles.sosButton, sendingSos && styles.sosButtonBusy]}
            onPress={handleSos}
            disabled={sendingSos}
            activeOpacity={0.85}
          >
            {!sendingSos && <Ionicons name="alert" size={40} color={colors.white} style={styles.sosIcon} />}
            <Text style={styles.sosButtonText}>{sendingSos ? 'Sending…' : 'SOS'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sosHint}>Press and hold isn't needed — one tap calls for help</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  statusText: { flex: 1, fontSize: patientTypography.subtitle, color: colors.text, fontWeight: '500' },
  sosArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sosRing: {
    width: 268,
    height: 268,
    borderRadius: 134,
    backgroundColor: colors.dangerSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  sosButtonBusy: { opacity: 0.8 },
  sosIcon: { marginBottom: 4 },
  sosButtonText: { color: colors.white, fontSize: patientTypography.title, fontWeight: '800', letterSpacing: 1 },
  sosHint: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.lg },
});
