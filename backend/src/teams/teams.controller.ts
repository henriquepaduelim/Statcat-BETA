import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, TeamScopeGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/athletes')
  addAthlete(@Param('id') teamId: string, @Body() dto: AssignAthleteDto) {
    return this.teamsService.addAthlete(teamId, dto.athleteId);
  }

  @Delete(':id/athletes/:athleteId')
  removeAthlete(@Param('id') teamId: string, @Param('athleteId') athleteId: string) {
    return this.teamsService.removeAthlete(teamId, athleteId);
  }

  @Post(':id/coaches')
  addCoach(@Param('id') teamId: string, @Body() dto: AssignCoachDto) {
    return this.teamsService.addCoach(teamId, dto.coachId);
  }

  @Delete(':id/coaches/:coachId')
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
