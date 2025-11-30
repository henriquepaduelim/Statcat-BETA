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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@CurrentUser() user: { sub: string; role: Role }) {
    return this.eventsService.findAllForUser(user.sub, user.role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH, Role.ATHLETE)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.eventsService.findOneScoped(id, user.sub, user.role);
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.eventsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.eventsService.update(id, dto, user.sub, user.role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.eventsService.remove(id, user.sub, user.role);
  }

  @Post(':id/invitations')
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH)
  async invite(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.eventsService.addInvitation(id, userId, user.sub, user.role);
  }

  @Post(':id/rsvp')
  @Roles(Role.ADMIN, Role.STAFF, Role.COACH, Role.ATHLETE)
  async rsvp(
    @Param('id') id: string,
    @Body() dto: RsvpDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.eventsService.rsvp(id, user.sub, dto);
  }
}
