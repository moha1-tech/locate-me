import { Injectable } from '@nestjs/common';
import { AlertType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CirclesService } from '../circles/circles.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushService } from '../push/push.service';
import { CreateSosDto } from './dto/create-sos.dto';

const GEOFENCE_ALERT_COOLDOWN_MINUTES = 15;

const ALERT_PUSH_TITLES: Record<AlertType, string> = {
  SOS: 'SOS pressed',
  GEOFENCE_EXIT: 'Left a safe zone',
  LOW_BATTERY: 'Phone battery low',
  CONNECTIVITY_LOST: 'Lost connectivity',
};

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly circles: CirclesService,
    private readonly realtime: RealtimeGateway,
    private readonly push: PushService,
  ) {}

  async triggerSos(patientUserId: string, dto: CreateSosDto) {
    const circle = await this.prisma.circle.findUnique({ where: { patientId: patientUserId } });
    if (!circle) {
      throw new Error('No circle found for this patient account');
    }
    return this.createAndBroadcast(circle.id, 'SOS', 'SOS button pressed', dto.latitude, dto.longitude);
  }

  async createGeofenceExitAlertIfNeeded(
    circleId: string,
    geofenceName: string,
    lat: number,
    lng: number,
  ) {
    const cooldownStart = new Date(Date.now() - GEOFENCE_ALERT_COOLDOWN_MINUTES * 60_000);
    const recent = await this.prisma.alert.findFirst({
      where: {
        circleId,
        type: 'GEOFENCE_EXIT',
        message: `Left safe zone: ${geofenceName}`,
        createdAt: { gte: cooldownStart },
      },
    });
    if (recent) {
      return null;
    }
    return this.createAndBroadcast(circleId, 'GEOFENCE_EXIT', `Left safe zone: ${geofenceName}`, lat, lng);
  }

  async createLowBatteryAlertIfNeeded(circleId: string, batteryLevel: number) {
    if (batteryLevel > 15) {
      return null;
    }
    const cooldownStart = new Date(Date.now() - 60 * 60_000);
    const recent = await this.prisma.alert.findFirst({
      where: { circleId, type: 'LOW_BATTERY', createdAt: { gte: cooldownStart } },
    });
    if (recent) {
      return null;
    }
    return this.createAndBroadcast(circleId, 'LOW_BATTERY', `Phone battery is at ${batteryLevel}%`);
  }

  async listForCircle(userId: string, circleId: string) {
    await this.circles.assertAccess(userId, circleId);
    return this.prisma.alert.findMany({ where: { circleId }, orderBy: { createdAt: 'desc' } });
  }

  async acknowledge(userId: string, alertId: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new Error('Alert not found');
    }
    await this.circles.assertAccess(userId, alert.circleId);
    return this.prisma.alert.update({
      where: { id: alertId },
      data: { acknowledgedBy: userId, acknowledgedAt: new Date() },
    });
  }

  private async createAndBroadcast(
    circleId: string,
    type: AlertType,
    message: string,
    latitude?: number,
    longitude?: number,
  ) {
    const alert = await this.prisma.alert.create({
      data: { circleId, type, message, latitude, longitude },
    });
    this.realtime.broadcastAlert(circleId, alert);
    await this.push.notifyCircle(circleId, ALERT_PUSH_TITLES[type], message, { alertId: alert.id, type });
    return alert;
  }
}
