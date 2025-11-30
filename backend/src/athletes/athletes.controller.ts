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
import { AthletesService } from './athletes.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AthleteScopeGuard } from '../common/guards/athlete-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('athletes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Get()
  findAll() {
    return this.athletesService.findAll();
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
