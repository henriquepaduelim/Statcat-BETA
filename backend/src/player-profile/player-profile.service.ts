import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';

type PlayerProfileResponse = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
  };
  athlete: {
    id: string;
    position: string | null;
    dominantFoot: string | null;
    status: string;
    dateOfBirth: Date | null;
    notes: string | null;
  };
  teams: Array<{
    id: string;
    name: string;
    ageGroup: string | null;
    status: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    startTime: Date;
    teamId: string | null;
    teamName: string | null;
    rsvpStatus: string | null;
    attendanceStatus: string | null;
  }>;
  recentEvents: Array<{
    id: string;
    title: string;
    type: string;
    startTime: Date;
    teamId: string | null;
    teamName: string | null;
    rsvpStatus: string | null;
    attendanceStatus: string | null;
  }>;
};

@Injectable()
export class PlayerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string, role: Role): Promise<PlayerProfileResponse> {
    if (role !== Role.ATHLETE) {
      throw new ForbiddenException('Only athletes can access player profile');
    }

    const athlete = await this.prisma.athlete.findUnique({
      where: { userId },
      include: {
        user: true,
        teams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!athlete) {
      throw new NotFoundException('Athlete profile not found');
    }

    const teamIds = athlete.teams.map((link) => link.teamId);
    const now = new Date();

    const events = await this.prisma.event.findMany({
      where: {
        startTime: { gte: now },
        OR: [
          { invitations: { some: { userId } } },
          { teamId: { in: teamIds } },
        ],
      },
      orderBy: { startTime: 'asc' },
      take: 10,
      include: {
        team: { select: { name: true } },
        invitations: {
          where: { userId },
          select: { rsvpStatus: true, attendanceStatus: true },
        },
      },
    });

    const recentEvents = await this.prisma.event.findMany({
      where: {
        startTime: { lt: now },
        OR: [
          { invitations: { some: { userId } } },
          { teamId: { in: teamIds } },
        ],
      },
      orderBy: { startTime: 'desc' },
      take: 5,
      include: {
        team: { select: { name: true } },
        invitations: {
          where: { userId },
          select: { rsvpStatus: true, attendanceStatus: true },
        },
      },
    });

    return {
      user: {
        id: athlete.user.id,
        email: athlete.user.email,
        firstName: athlete.user.firstName,
        lastName: athlete.user.lastName,
        role: athlete.user.role as Role,
      },
      athlete: {
        id: athlete.id,
        position: athlete.position,
        dominantFoot: athlete.dominantFoot,
        status: athlete.status,
        dateOfBirth: athlete.dateOfBirth,
        notes: athlete.notes,
      },
      teams: athlete.teams.map((link) => ({
        id: link.team.id,
        name: link.team.name,
        ageGroup: link.team.ageGroup,
        status: link.team.status,
      })),
      upcomingEvents: events.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        startTime: event.startTime,
        teamId: event.teamId,
        teamName: event.team?.name ?? null,
        rsvpStatus: event.invitations[0]?.rsvpStatus ?? null,
        attendanceStatus: event.invitations[0]?.attendanceStatus ?? null,
      })),
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        startTime: event.startTime,
        teamId: event.teamId,
        teamName: event.team?.name ?? null,
        rsvpStatus: event.invitations[0]?.rsvpStatus ?? null,
        attendanceStatus: event.invitations[0]?.attendanceStatus ?? null,
      })),
    };
  }
}
