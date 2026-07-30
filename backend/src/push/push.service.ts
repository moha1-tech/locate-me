import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly expo = new Expo();

  constructor(private readonly prisma: PrismaService) {}

  /** Pushes to every accepted caregiver member of the circle (not the patient themselves). */
  async notifyCircle(circleId: string, title: string, body: string, data?: Record<string, unknown>) {
    const circle = await this.prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        members: { where: { status: 'ACCEPTED' }, include: { caregiver: { select: { devicePushToken: true } } } },
      },
    });
    if (!circle) {
      return;
    }

    const tokens = circle.members
      .map((m) => m.caregiver.devicePushToken)
      .filter((t): t is string => !!t && Expo.isExpoPushToken(t));
    if (tokens.length === 0) {
      return;
    }

    const messages: ExpoPushMessage[] = tokens.map((to) => ({ to, title, body, data, sound: 'default' }));
    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        this.logger.warn(`Failed to send a push notification chunk: ${err}`);
      }
    }
  }
}
