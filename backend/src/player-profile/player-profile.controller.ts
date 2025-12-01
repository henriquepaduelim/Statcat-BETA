import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload';
import { PlayerProfileService } from './player-profile.service';

@Controller('player-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlayerProfileController {
  constructor(private readonly playerProfileService: PlayerProfileService) {}

  @Get()
  @Roles(Role.ATHLETE)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.playerProfileService.getProfile(user.sub, user.role);
  }
}
