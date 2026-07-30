import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { LiveService } from './live.service';

@UseGuards(JwtAuthGuard)
@Controller('circles/:circleId/live-token')
export class LiveController {
  constructor(private readonly live: LiveService) {}

  @Get()
  getToken(@CurrentUser() user: AuthUser, @Param('circleId') circleId: string) {
    return this.live.createToken(user.userId, circleId);
  }
}
