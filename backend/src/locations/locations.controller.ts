import { Controller, Get, Param, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { LocationsService } from './locations.service';
import { CreateLocationPingDto } from './dto/create-location-ping.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Post('locations')
  ingest(@CurrentUser() user: AuthUser, @Body() dto: CreateLocationPingDto) {
    return this.locations.ingest(user.userId, dto);
  }

  @Get('circles/:circleId/locations/latest')
  latest(@CurrentUser() user: AuthUser, @Param('circleId') circleId: string) {
    return this.locations.getLatest(user.userId, circleId);
  }

  @Get('circles/:circleId/locations/history')
  history(
    @CurrentUser() user: AuthUser,
    @Param('circleId') circleId: string,
    @Query('hours') hours?: string,
  ) {
    return this.locations.getHistory(user.userId, circleId, hours ? Number(hours) : undefined);
  }
}
