import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CirclesService } from '../circles/circles.service';
import { GeofencesService } from '../geofences/geofences.service';
import { AlertsService } from '../alerts/alerts.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateLocationPingDto } from './dto/create-location-ping.dto';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly circles: CirclesService,
    private readonly geofences: GeofencesService,
    private readonly alerts: AlertsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async ingest(patientUserId: string, dto: CreateLocationPingDto) {
    const circle = await this.prisma.circle.findUnique({ where: { patientId: patientUserId } });
    if (!circle) {
      throw new NotFoundException('No circle found for this patient account');
    }

    const [ping] = await this.prisma.$transaction([
      this.prisma.locationPing.create({ data: { userId: patientUserId, ...dto } }),
      this.prisma.user.update({
        where: { id: patientUserId },
        data: { lastSeenAt: new Date(), lastBatteryLevel: dto.batteryLevel },
      }),
    ]);

    this.realtime.broadcastLocation(circle.id, ping);

    const exited = await this.geofences.findExitedGeofences(circle.id, dto.latitude, dto.longitude);
    await Promise.all(
      exited.map((g) => this.alerts.createGeofenceExitAlertIfNeeded(circle.id, g.name, dto.latitude, dto.longitude)),
    );

    if (dto.batteryLevel !== undefined) {
      await this.alerts.createLowBatteryAlertIfNeeded(circle.id, dto.batteryLevel);
    }

    return ping;
  }

  async getLatest(userId: string, circleId: string) {
    const circle = await this.circles.assertAccess(userId, circleId);
    return this.prisma.locationPing.findFirst({
      where: { userId: circle.patientId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getHistory(userId: string, circleId: string, sinceHours = 24) {
    const circle = await this.circles.assertAccess(userId, circleId);
    const since = new Date(Date.now() - sinceHours * 60 * 60_000);
    return this.prisma.locationPing.findMany({
      where: { userId: circle.patientId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    });
  }
}
