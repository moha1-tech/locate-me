import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch('push-token')
  updatePushToken(@CurrentUser() user: AuthUser, @Body() dto: UpdatePushTokenDto) {
    return this.users.updatePushToken(user.userId, dto.token);
  }
}
