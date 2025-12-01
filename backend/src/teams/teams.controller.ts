import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AssignAthleteDto } from './dto/assign-athlete.dto';
import { AssignCoachDto } from './dto/assign-coach.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { TeamScopeGuard } from '../common/guards/team-scope.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload';
import { ListTeamsDto } from './dto/list-teams.dto';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH, Role.ATHLETE)
  findAll(@CurrentUser() user: JwtPayload, @Query() query: ListTeamsDto) {
    return this.teamsService.findAllForUser(user.sub, user.role, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, TeamScopeGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/athletes')
  @Roles(Role.ADMIN, Role.STAFF)
  addAthlete(@Param('id') teamId: string, @Body() dto: AssignAthleteDto) {
    return this.teamsService.addAthlete(teamId, dto.athleteId);
  }

  @Delete(':id/athletes/:athleteId')
  @Roles(Role.ADMIN, Role.STAFF)
  removeAthlete(@Param('id') teamId: string, @Param('athleteId') athleteId: string) {
    return this.teamsService.removeAthlete(teamId, athleteId);
  }

  @Post(':id/coaches')
  @Roles(Role.ADMIN, Role.STAFF)
  addCoach(@Param('id') teamId: string, @Body() dto: AssignCoachDto) {
    return this.teamsService.addCoach(teamId, dto.coachId);
  }

  @Delete(':id/coaches/:coachId')
  @Roles(Role.ADMIN, Role.STAFF)
  removeCoach(@Param('id') teamId: string, @Param('coachId') coachId: string) {
    return this.teamsService.removeCoach(teamId, coachId);
  }

  @Get(':id/roster')
  @UseGuards(JwtAuthGuard, RolesGuard, TeamScopeGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH, Role.ATHLETE)
  roster(@Param('id') teamId: string) {
    return this.teamsService.roster(teamId);
  }
}
