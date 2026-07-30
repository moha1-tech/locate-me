import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import CaregiverNavigator from './CaregiverNavigator';
import { colors } from '../theme';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? <AuthNavigator /> : user.role === 'PATIENT' ? <PatientNavigator /> : <CaregiverNavigator />}
    </NavigationContainer>
  );
}
