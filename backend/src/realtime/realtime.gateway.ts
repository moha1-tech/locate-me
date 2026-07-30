import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { CirclesService } from '../circles/circles.service';

@WebSocketGateway({ cors: true, namespace: '/realtime' })
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly circles: CirclesService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwt.verify(token);
      client.data.userId = payload.sub;
    } catch {
      this.logger.warn(`Rejected socket connection with invalid token`);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join-circle')
  async joinCircle(@ConnectedSocket() client: Socket, @MessageBody() data: { circleId: string }) {
    await this.circles.assertAccess(client.data.userId, data.circleId);
    await client.join(`circle:${data.circleId}`);
    return { joined: data.circleId };
  }

  broadcastLocation(circleId: string, payload: unknown) {
    this.server.to(`circle:${circleId}`).emit('location:update', payload);
  }

  broadcastAlert(circleId: string, payload: unknown) {
    this.server.to(`circle:${circleId}`).emit('alert:new', payload);
  }
}
