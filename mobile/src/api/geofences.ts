import { apiClient } from './client';
import { Geofence } from '../types';

export function listGeofences(circleId: string) {
  return apiClient.get<Geofence[]>(`/circles/${circleId}/geofences`).then((res) => res.data);
}

export function createGeofence(
  circleId: string,
  input: { name: string; centerLat: number; centerLng: number; radiusMeters: number },
) {
  return apiClient.post<Geofence>(`/circles/${circleId}/geofences`, input).then((res) => res.data);
}

export function deleteGeofence(circleId: string, geofenceId: string) {
  return apiClient.delete(`/circles/${circleId}/geofences/${geofenceId}`).then((res) => res.data);
}
