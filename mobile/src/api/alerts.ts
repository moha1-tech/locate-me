import { apiClient } from './client';
import { AppAlert } from '../types';

export function triggerSos(latitude?: number, longitude?: number) {
  return apiClient.post<AppAlert>('/alerts/sos', { latitude, longitude }).then((res) => res.data);
}

export function listAlerts(circleId: string) {
  return apiClient.get<AppAlert[]>(`/circles/${circleId}/alerts`).then((res) => res.data);
}

export function acknowledgeAlert(alertId: string) {
  return apiClient.post<AppAlert>(`/alerts/${alertId}/acknowledge`).then((res) => res.data);
}
