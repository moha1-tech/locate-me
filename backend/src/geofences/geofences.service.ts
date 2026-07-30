import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CirclesService } from '../circles/circles.service';
import { UpsertGeofenceDto } from './dto/upsert-geofence.dto';
import { distanceMeters } from '../common/geo.util';

@Injectable()
export class GeofencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly circles: CirclesService,
  ) {}

  async list(userId: string, circleId: string) {
    await this.circles.assertAccess(userId, circleId);
    return this.prisma.geofence.findMany({ where: { circleId } });
  }

  async create(userId: string, circleId: string, dto: UpsertGeofenceDto) {
    await this.circles.assertAdminAccess(userId, circleId);
    return this.prisma.geofence.create({ data: { circleId, ...dto } });
  }

  async remove(userId: string, circleId: string, geofenceId: string) {
    await this.circles.assertAdminAccess(userId, circleId);
    const geofence = await this.prisma.geofence.findUnique({ where: { id: geofenceId } });
    if (!geofence || geofence.circleId !== circleId) {
      throw new NotFoundException('Geofence not found');
    }
    await this.prisma.geofence.delete({ where: { id: geofenceId } });
    return { deleted: true };
  }

  /** Returns geofences the given point falls outside of, for a circle. */
  async findExitedGeofences(circleId: string, lat: number, lng: number) {
    const geofences = await this.prisma.geofence.findMany({ where: { circleId } });
    return geofences.filter((g) => distanceMeters(lat, lng, g.centerLat, g.centerLng) > g.radiusMeters);
  }
}
