import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { TeamScopeGuard } from '../common/guards/team-scope.guard';

@Module({
  imports: [PrismaModule],
  controllers: [TeamsController],
  providers: [TeamsService, RolesGuard, TeamScopeGuard],
  exports: [TeamsService],
})
export class TeamsModule {}
