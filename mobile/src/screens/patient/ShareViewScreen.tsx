import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AudioSession, LiveKitRoom } from '@livekit/react-native';
import { getMyCircle } from '../../api/circles';
import { getLiveToken, LiveTokenResponse } from '../../api/live';
import { colors, patientTypography, radii, spacing } from '../../theme';
import { LIVE_VIEW_ENABLED } from '../../config';

/**
 * Publishes this device's camera + mic into the circle's LiveKit room. Whoever on the
 * caregiver side has the "Live view" screen open will see and hear this in real time.
 */
export default function ShareViewScreen() {
  const [session, setSession] = useState<LiveTokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!LIVE_VIEW_ENABLED) return;
    let cancelled = false;
    AudioSession.startAudioSession();

    getMyCircle()
      .then((circle) => getLiveToken(circle.id))
      .then((token) => !cancelled && setSession(token))
      .catch(() => !cancelled && setError('Could not connect. Check your internet connection.'));

    return () => {
      cancelled = true;
      AudioSession.stopAudioSession();
    };
  }, []);

  if (!LIVE_VIEW_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="videocam-outline" size={40} color={colors.textMuted} />
          <Text style={styles.message}>Not yet available. Video and voice sharing is coming soon.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={styles.message}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.message}>Connecting…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LiveKitRoom serverUrl={session.url} token={session.token} connect audio video>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>
        <View style={styles.bottomBanner}>
          <Ionicons name="eye-outline" size={20} color={colors.white} style={{ marginRight: spacing.sm }} />
          <Text style={styles.caption}>Your caregiver can now see and hear you</Text>
        </View>
      </SafeAreaView>
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  caption: { color: colors.white, fontSize: 16, textAlign: 'center', flexShrink: 1 },
  message: { color: '#E2E8F0', fontSize: patientTypography.body, textAlign: 'center' },
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.white, marginRight: 6 },
  liveBadgeText: { color: colors.white, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  bottomBanner: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: radii.lg,
    padding: spacing.md,
  },
});
