import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { AlertsService } from './alerts.service';
import { CreateSosDto } from './dto/create-sos.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Post('alerts/sos')
  triggerSos(@CurrentUser() user: AuthUser, @Body() dto: CreateSosDto) {
    return this.alerts.triggerSos(user.userId, dto);
  }

  @Get('circles/:circleId/alerts')
  list(@CurrentUser() user: AuthUser, @Param('circleId') circleId: string) {
    return this.alerts.listForCircle(user.userId, circleId);
  }

  @Post('alerts/:alertId/acknowledge')
  acknowledge(@CurrentUser() user: AuthUser, @Param('alertId') alertId: string) {
    return this.alerts.acknowledge(user.userId, alertId);
  }
}
