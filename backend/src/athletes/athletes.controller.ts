import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AthleteScopeGuard } from '../common/guards/athlete-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ListAthletesDto } from './dto/list-athletes.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload';

@Controller('athletes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Get()
  findAll(@Query() query: ListAthletesDto, @CurrentUser() user: JwtPayload) {
    return this.athletesService.findAll(query, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, AthleteScopeGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH, Role.ATHLETE)
  findOne(@Param('id') id: string) {
    return this.athletesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAthleteDto) {
    return this.athletesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, AthleteScopeGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
  update(@Param('id') id: string, @Body() dto: UpdateAthleteDto) {
    return this.athletesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.athletesService.remove(id);
  }
}
