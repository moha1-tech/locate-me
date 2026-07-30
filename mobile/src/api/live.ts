import { apiClient } from './client';

export interface LiveTokenResponse {
  url: string;
  roomName: string;
  token: string;
}

export function getLiveToken(circleId: string) {
  return apiClient.get<LiveTokenResponse>(`/circles/${circleId}/live-token`).then((res) => res.data);
}
