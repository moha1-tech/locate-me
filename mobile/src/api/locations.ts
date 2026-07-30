import { apiClient } from './client';
import { LocationPing } from '../types';

export interface LocationPingInput {
  latitude: number;
  longitude: number;
  accuracy?: number;
  batteryLevel?: number;
}

export function sendLocationPing(input: LocationPingInput) {
  return apiClient.post<LocationPing>('/locations', input).then((res) => res.data);
}

export function getLatestLocation(circleId: string) {
  return apiClient.get<LocationPing | null>(`/circles/${circleId}/locations/latest`).then((res) => res.data);
}

export function getLocationHistory(circleId: string, hours = 24) {
  return apiClient
    .get<LocationPing[]>(`/circles/${circleId}/locations/history`, { params: { hours } })
    .then((res) => res.data);
}
