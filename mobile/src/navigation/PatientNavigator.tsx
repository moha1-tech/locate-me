import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PatientTabParamList } from './types';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import ShareViewScreen from '../screens/patient/ShareViewScreen';
import PatientSettingsScreen from '../screens/patient/PatientSettingsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<PatientTabParamList>();

const ICONS: Record<keyof PatientTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  ShareView: 'videocam',
  Settings: 'settings',
};

export default function PatientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        tabBarStyle: { height: 72, paddingBottom: 12, paddingTop: 10, borderTopColor: colors.border },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name as keyof PatientTabParamList] : (`${ICONS[route.name as keyof PatientTabParamList]}-outline` as keyof typeof Ionicons.glyphMap)}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={PatientHomeScreen} options={{ title: 'Home', headerShown: false }} />
      <Tab.Screen name="ShareView" component={ShareViewScreen} options={{ title: 'Share view', headerShown: false }} />
      <Tab.Screen name="Settings" component={PatientSettingsScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
