import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { colors, radii, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoBadge}>
          <Ionicons name="location" size={44} color={colors.white} />
        </View>
        <Text style={styles.title}>LocateMe</Text>
        <Text style={styles.subtitle}>Stay connected with the people who care about you.</Text>

        <View style={styles.featureList}>
          <Feature icon="navigate" text="Real-time location, always up to date" />
          <Feature icon="shield-checkmark" text="Instant alerts when it matters" />
          <Feature icon="videocam" text="See and talk to each other, live" />
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Log in" size="large" onPress={() => navigation.navigate('Login')} />
        <Button
          label="Create an account"
          size="large"
          variant="secondary"
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </SafeAreaView>
  );
}

function Feature({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 36, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 17,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  featureList: { width: '100%', gap: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  featureText: { fontSize: 15, color: colors.text, fontWeight: '500', flex: 1 },
  actions: { paddingBottom: spacing.lg, gap: spacing.sm },
  secondaryButton: { marginTop: spacing.xs },
});
