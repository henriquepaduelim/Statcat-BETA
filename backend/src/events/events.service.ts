import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { Role } from '../common/enums/role.enum';
import { RsvpStatus } from '../common/enums/rsvp-status.enum';
import type { Prisma, Event, EventInvitation, EventType } from '@prisma/client';
import { ListEventsDto } from './dto/list-events.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, creatorId: string): Promise<Event> {
    await this.ensureCoachCanCreate(dto.teamId, creatorId);

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        location: dto.location,
        startTime: new Date(dto.startTime),
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        teamId: dto.teamId,
        createdById: creatorId,
        invitations: dto.inviteeIds
          ? {
              createMany: {
                data: dto.inviteeIds.map((userId) => ({
                  userId,
                })),
                skipDuplicates: true,
              },
            }
          : undefined,
      },
    });

    // TODO: enqueue notifications/reminders here
    return event;
  }

  async findAllForUser(userId: string, role: Role, query: ListEventsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const baseWhere: Prisma.EventWhereInput = {};

    if (query.search) {
      baseWhere.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.type) {
      baseWhere.type = query.type as EventType;
    }
    if (query.teamId) {
      baseWhere.teamId = query.teamId;
    }

    if (role === Role.ADMIN || role === Role.STAFF) {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.event.findMany({
          where: baseWhere,
          orderBy: { startTime: 'asc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.event.count({ where: baseWhere }),
      ]);
      return { items, total, page, pageSize };
    }

    if (role === Role.COACH) {
      const scopedWhere: Prisma.EventWhereInput = {
        ...baseWhere,
        OR: [
          { createdById: userId },
          { invitations: { some: { userId } } },
          { team: { coaches: { some: { coachId: userId } } } },
        ],
      };
      const [items, total] = await this.prisma.$transaction([
        this.prisma.event.findMany({
          where: scopedWhere,
          orderBy: { startTime: 'asc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.event.count({ where: scopedWhere }),
      ]);
      return { items, total, page, pageSize };
    }

    // Athlete
    const athlete = await this.prisma.athlete.findUnique({
      where: { userId },
      select: { id: true },
    });
    const orFilters: Prisma.EventWhereInput[] = [
      { invitations: { some: { userId } } },
    ];
    if (athlete) {
      orFilters.push({
        team: { athletes: { some: { athleteId: athlete.id } } },
      });
    }

    const scopedWhere: Prisma.EventWhereInput = {
      ...baseWhere,
      OR: orFilters,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where: scopedWhere,
        orderBy: { startTime: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.event.count({ where: scopedWhere }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOneScoped(eventId: string, userId: string, role: Role) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { invitations: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (role === Role.ADMIN || role === Role.STAFF) {
      return event;
    }

    if (role === Role.COACH) {
      const coachAccess =
        event.createdById === userId ||
        event.invitations.some(
          (inv: EventInvitation) => inv.userId === userId,
        ) ||
        (event.teamId
          ? await this.isCoachOnTeam(userId, event.teamId)
          : false);
      if (!coachAccess) {
        throw new ForbiddenException('Access denied');
      }
      return event;
    }

    // Athlete
    const athlete = await this.prisma.athlete.findUnique({
      where: { userId },
      select: { id: true },
    });
    const athleteAccess =
      event.invitations.some((inv: EventInvitation) => inv.userId === userId) ||
      (athlete && event.teamId
        ? await this.isAthleteOnTeam(athlete.id, event.teamId)
        : false);
    if (!athleteAccess) {
      throw new ForbiddenException('Access denied');
    }
    return event;
  }

  async update(eventId: string, dto: UpdateEventDto, userId: string, role: Role) {
    await this.ensureCanEdit(eventId, userId, role);
    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        location: dto.location,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        teamId: dto.teamId,
      },
    });

    if (dto.inviteeIds) {
      await this.prisma.eventInvitation.createMany({
        data: dto.inviteeIds.map((userId) => ({ userId, eventId })),
        skipDuplicates: true,
      });
    }
    // TODO: enqueue notifications/reminders for updates
    return event;
  }

  async remove(eventId: string, userId: string, role: Role): Promise<void> {
    await this.ensureCanEdit(eventId, userId, role);
    await this.prisma.event.delete({ where: { id: eventId } });
  }

  async addInvitation(
    eventId: string,
    userId: string,
    actorId: string,
    role: Role,
  ): Promise<EventInvitation> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User to invite not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { invitations: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.ensureCanEdit(eventId, actorId, role);
    return this.prisma.eventInvitation.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId },
      update: {},
    });
  }

  async rsvp(eventId: string, userId: string, dto: RsvpDto): Promise<void> {
    const invitation = await this.prisma.eventInvitation.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!invitation) {
      throw new ForbiddenException('Not invited to this event');
    }
    await this.prisma.eventInvitation.update({
      where: { eventId_userId: { eventId, userId } },
      data: {
        rsvpStatus: dto.status ?? RsvpStatus.PENDING,
        respondedAt: new Date(),
      },
    });
  }

  private async ensureCoachCanCreate(teamId: string | undefined, creatorId: string) {
    if (!teamId) return;
    // Admin/Staff bypass
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      select: { role: true },
    });
    if (creator?.role === Role.ADMIN || creator?.role === Role.STAFF) {
      return;
    }
    const coachAssigned = await this.prisma.teamCoach.findUnique({
      where: { teamId_coachId: { teamId, coachId: creatorId } },
    });
    if (!coachAssigned) {
      throw new ForbiddenException('Coach not assigned to this team');
    }
  }

  private async ensureCanEdit(eventId: string, userId: string, role: Role) {
    if (role === Role.ADMIN || role === Role.STAFF) {
      return;
    }
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (role === Role.COACH) {
      const isCreator = event.createdById === userId;
      const coachAssigned = event.teamId
        ? await this.isCoachOnTeam(userId, event.teamId)
        : false;
      if (!isCreator && !coachAssigned) {
        throw new ForbiddenException('Coach cannot modify this event');
      }
      return;
    }
    throw new ForbiddenException('Only admin/staff or assigned coach can modify');
  }

  private async isCoachOnTeam(coachId: string, teamId: string): Promise<boolean> {
    const membership = await this.prisma.teamCoach.findUnique({
      where: { teamId_coachId: { teamId, coachId } },
    });
    return Boolean(membership);
  }

  private async isAthleteOnTeam(
    athleteId: string,
    teamId: string,
  ): Promise<boolean> {
    const membership = await this.prisma.teamAthlete.findUnique({
      where: { teamId_athleteId: { teamId, athleteId } },
    });
    return Boolean(membership);
  }
}
