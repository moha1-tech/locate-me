import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { getToken } from '../api/client';

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }
  const token = await getToken();
  socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinCircleRoom(circleId: string) {
  socket?.emit('join-circle', { circleId });
}
