import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import { sendOrQueuePing } from './locationQueue';

export const LOCATION_TASK_NAME = 'locateme-background-location';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }
  const { locations } = (data as { locations: Location.LocationObject[] }) ?? { locations: [] };
  const latest = locations?.[locations.length - 1];
  if (!latest) {
    return;
  }
  const batteryLevel = await Battery.getBatteryLevelAsync();
  await sendOrQueuePing({
    latitude: latest.coords.latitude,
    longitude: latest.coords.longitude,
    accuracy: latest.coords.accuracy ?? undefined,
    batteryLevel: Math.round(batteryLevel * 100),
  });
});

export async function requestLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return { granted: false, background: false };
  }
  const background = await Location.requestBackgroundPermissionsAsync();
  return { granted: true, background: background.status === 'granted' };
}

export async function startBackgroundTracking() {
  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (alreadyStarted) {
    return;
  }
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 60_000,
    distanceInterval: 50,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'LocateMe is sharing your location',
      notificationBody: 'Your caregivers can see where you are.',
    },
  });
}

export async function stopBackgroundTracking() {
  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (alreadyStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}

export async function sendOneOffPing() {
  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const batteryLevel = await Battery.getBatteryLevelAsync();
  return sendOrQueuePing({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy ?? undefined,
    batteryLevel: Math.round(batteryLevel * 100),
  });
}
