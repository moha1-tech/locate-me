import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CaregiverTabParamList } from './types';
import MapScreen from '../screens/caregiver/MapScreen';
import LiveViewScreen from '../screens/caregiver/LiveViewScreen';
import AlertsScreen from '../screens/caregiver/AlertsScreen';
import GeofencesScreen from '../screens/caregiver/GeofencesScreen';
import CircleScreen from '../screens/caregiver/CircleScreen';
import { CircleProvider } from '../context/CircleContext';
import { registerForPushNotifications } from '../services/pushNotifications';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<CaregiverTabParamList>();

const ICONS: Record<keyof CaregiverTabParamList, keyof typeof Ionicons.glyphMap> = {
  Map: 'map',
  LiveView: 'videocam',
  Alerts: 'notifications',
  Geofences: 'shield',
  Circle: 'people',
};

export default function CaregiverNavigator() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return (
    <CircleProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarStyle: { height: 68, paddingBottom: 10, paddingTop: 6, borderTopColor: colors.border },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { fontWeight: '800', color: colors.text },
          tabBarIcon: ({ color, size, focused }) => {
            const name = ICONS[route.name as keyof CaregiverTabParamList];
            return (
              <Ionicons
                name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
        <Tab.Screen name="LiveView" component={LiveViewScreen} options={{ title: 'Live view', headerShown: false }} />
        <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
        <Tab.Screen name="Geofences" component={GeofencesScreen} options={{ title: 'Safe zones' }} />
        <Tab.Screen name="Circle" component={CircleScreen} options={{ title: 'Circle' }} />
      </Tab.Navigator>
    </CircleProvider>
  );
}
