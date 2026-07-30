import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { GeofencesService } from './geofences.service';
import { UpsertGeofenceDto } from './dto/upsert-geofence.dto';

@UseGuards(JwtAuthGuard)
@Controller('circles/:circleId/geofences')
export class GeofencesController {
  constructor(private readonly geofences: GeofencesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('circleId') circleId: string) {
    return this.geofences.list(user.userId, circleId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('circleId') circleId: string,
    @Body() dto: UpsertGeofenceDto,
  ) {
    return this.geofences.create(user.userId, circleId, dto);
  }

  @Delete(':geofenceId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('circleId') circleId: string,
    @Param('geofenceId') geofenceId: string,
  ) {
    return this.geofences.remove(user.userId, circleId, geofenceId);
  }
}
