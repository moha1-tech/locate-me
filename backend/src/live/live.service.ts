import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';
import { CirclesService } from '../circles/circles.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LiveService {
  constructor(
    private readonly config: ConfigService,
    private readonly circles: CirclesService,
    private readonly prisma: PrismaService,
  ) {}

  async createToken(userId: string, circleId: string) {
    await this.circles.assertAccess(userId, circleId);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const roomName = `circle-${circleId}`;
    const apiKey = this.config.get<string>('LIVEKIT_API_KEY') ?? 'devkey';
    const apiSecret = this.config.get<string>('LIVEKIT_API_SECRET') ?? 'secret';

    const token = new AccessToken(apiKey, apiSecret, { identity: userId, name: user.name });
    token.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true });

    return {
      url: this.config.get<string>('LIVEKIT_URL') ?? 'ws://localhost:7880',
      roomName,
      token: await token.toJwt(),
    };
  }
}
