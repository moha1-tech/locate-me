import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { CirclesService } from './circles.service';
import { InviteCaregiverDto } from './dto/invite-caregiver.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class CirclesController {
  constructor(private readonly circles: CirclesService) {}

  @Get('circles/mine')
  getMine(@CurrentUser() user: AuthUser) {
    if (user.role === 'PATIENT') {
      return this.circles.getMyCircleAsPatient(user.userId);
    }
    return this.circles.listCirclesForCaregiver(user.userId);
  }

  @Get('invites/mine')
  getPendingInvites(@CurrentUser() user: AuthUser) {
    return this.circles.listPendingInvites(user.userId);
  }

  @Post('circles/:circleId/invite')
  invite(
    @CurrentUser() user: AuthUser,
    @Param('circleId') circleId: string,
    @Body() dto: InviteCaregiverDto,
  ) {
    return this.circles.inviteCaregiver(user.userId, circleId, dto);
  }

  @Post('circles/:circleId/accept')
  accept(@CurrentUser() user: AuthUser, @Param('circleId') circleId: string) {
    return this.circles.acceptInvite(user.userId, circleId);
  }
}
