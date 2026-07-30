import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  AudioSession,
  isTrackReference,
  LiveKitRoom,
  TrackReferenceOrPlaceholder,
  useTracks,
  VideoTrack,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useCircle } from '../../context/CircleContext';
import { getLiveToken, LiveTokenResponse } from '../../api/live';
import { EmptyState } from '../../components';
import { colors, radii, spacing } from '../../theme';
import { LIVE_VIEW_ENABLED } from '../../config';

export default function LiveViewScreen() {
  const { activeCircle } = useCircle();
  const [session, setSession] = useState<LiveTokenResponse | null>(null);

  useEffect(() => {
    if (!LIVE_VIEW_ENABLED || !activeCircle) return;
    let cancelled = false;
    AudioSession.startAudioSession();
    getLiveToken(activeCircle.id).then((token) => !cancelled && setSession(token));
    return () => {
      cancelled = true;
      AudioSession.stopAudioSession();
    };
  }, [activeCircle?.id]);

  if (!LIVE_VIEW_ENABLED) {
    return (
      <SafeAreaView style={styles.center}>
        <EmptyState
          icon="videocam-outline"
          title="Not yet available"
          message="Live video and voice is coming soon. Location and alerts are fully working in the meantime."
        />
      </SafeAreaView>
    );
  }

  if (!activeCircle) {
    return (
      <SafeAreaView style={styles.center}>
        <EmptyState icon="people-outline" title="No circle yet" message="No one has added you to their circle yet." />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.center}>
        <EmptyState icon="videocam-outline" title="Connecting…" />
      </SafeAreaView>
    );
  }

  return (
    <LiveKitRoom serverUrl={session.url} token={session.token} connect audio video={false}>
      <RoomView patientName={activeCircle.patient?.name} />
    </LiveKitRoom>
  );
}

function RoomView({ patientName }: { patientName?: string }) {
  const tracks = useTracks([Track.Source.Camera]);

  if (tracks.length === 0) {
    return (
      <View style={styles.waitingBox}>
        <View style={styles.waitingIconCircle}>
          <Ionicons name="videocam-outline" size={32} color={colors.textFaint} />
        </View>
        <Text style={styles.waitingTitle}>Waiting for {patientName ?? 'them'} to share their view</Text>
        <Text style={styles.waitingSubtitle}>This updates instantly once they open "Share my view".</Text>
      </View>
    );
  }

  const renderTrack: ListRenderItem<TrackReferenceOrPlaceholder> = ({ item }) =>
    isTrackReference(item) ? <VideoTrack trackRef={item} style={styles.video} /> : null;

  return (
    <View style={styles.container}>
      <FlatList data={tracks} renderItem={renderTrack} />
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveBadgeText}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
  center: { flex: 1, backgroundColor: colors.background },
  waitingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.xl },
  waitingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  waitingTitle: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  waitingSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  liveBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.white, marginRight: 6 },
  liveBadgeText: { color: colors.white, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
});
