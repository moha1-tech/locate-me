import { apiClient } from './client';
import { Circle, PendingInvite } from '../types';

export function getMyCircle() {
  return apiClient.get<Circle>('/circles/mine').then((res) => res.data);
}

export function getMyCircles() {
  return apiClient.get<Circle[]>('/circles/mine').then((res) => res.data);
}

export function inviteCaregiver(circleId: string, email: string, permission: 'ADMIN' | 'VIEW_ONLY' = 'VIEW_ONLY') {
  return apiClient.post(`/circles/${circleId}/invite`, { email, permission }).then((res) => res.data);
}

export function acceptInvite(circleId: string) {
  return apiClient.post(`/circles/${circleId}/accept`).then((res) => res.data);
}

export function getPendingInvites() {
  return apiClient.get<PendingInvite[]>('/invites/mine').then((res) => res.data);
}
