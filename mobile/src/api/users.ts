import { apiClient } from './client';

export function updatePushToken(token: string) {
  return apiClient.patch('/users/me/push-token', { token }).then((res) => res.data);
}
