import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { RsvpStatus } from '../common/enums/rsvp-status.enum';

type OverviewStats = {
  teams: number;
  athletes: number;
  upcomingEvents: number;
  pendingInvitations: number;
};

type OverviewEvent = {
  id: string;
  title: string;
  type: string;
  startTime: Date;
  teamId: string | null;
  teamName: string | null;
  rsvpStatus: string | null;
};

type DashboardOverview = {
  stats: OverviewStats;
  upcomingEvents: OverviewEvent[];
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string, role: Role): Promise<DashboardOverview> {
    const now = new Date();

    if (role === Role.ADMIN || role === Role.STAFF) {
      return this.getAdminOverview(userId, now);
    }

    if (role === Role.COACH) {
      return this.getCoachOverview(userId, now);
    }

    // Athlete
    return this.getAthleteOverview(userId, now);
  }

  private async getAdminOverview(userId: string, now: Date): Promise<DashboardOverview> {
    const [teams, athletes, upcomingEventsCount, upcomingEvents, pendingInvitations] =
      await Promise.all([
        this.prisma.team.count(),
        this.prisma.athlete.count(),
        this.prisma.event.count({
          where: { startTime: { gte: now } },
        }),
        this.prisma.event.findMany({
          where: { startTime: { gte: now } },
          orderBy: { startTime: 'asc' },
          take: 5,
          include: {
            team: { select: { name: true } },
            invitations: {
              where: { userId },
              select: { rsvpStatus: true },
            },
          },
        }),
        this.prisma.eventInvitation.count({
          where: { userId, rsvpStatus: RsvpStatus.PENDING },
        }),
      ]);

    return {
      stats: {
        teams,
        athletes,
        upcomingEvents: upcomingEventsCount,
        pendingInvitations,
      },
      upcomingEvents: upcomingEvents.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        startTime: event.startTime,
        teamId: event.teamId,
        teamName: event.team?.name ?? null,
        rsvpStatus: event.invitations[0]?.rsvpStatus ?? null,
      })),
    };
  }

  private async getCoachOverview(userId: string, now: Date): Promise<DashboardOverview> {
    const teamLinks = await this.prisma.teamCoach.findMany({
      where: { coachId: userId },
      select: { teamId: true },
    });
    const teamIds = teamLinks.map((link) => link.teamId);

    const [teams, athletes, upcomingEventsCount, upcomingEvents, pendingInvitations] =
      await Promise.all([
        teamIds.length,
        this.countDistinctAthletes(teamIds),
        this.prisma.event.count({
          where: {
            startTime: { gte: now },
            OR: [
              { teamId: { in: teamIds } },
              { createdById: userId },
              { invitations: { some: { userId } } },
            ],
          },
        }),
        this.prisma.event.findMany({
          where: {
            startTime: { gte: now },
            OR: [
              { teamId: { in: teamIds } },
              { createdById: userId },
              { invitations: { some: { userId } } },
            ],
          },
          orderBy: { startTime: 'asc' },
          take: 5,
          include: {
            team: { select: { name: true } },
            invitations: {
              where: { userId },
              select: { rsvpStatus: true },
            },
          },
        }),
        this.prisma.eventInvitation.count({
          where: { userId, rsvpStatus: RsvpStatus.PENDING },
        }),
      ]);

    return {
      stats: {
        teams,
        athletes,
        upcomingEvents: upcomingEventsCount,
        pendingInvitations,
      },
      upcomingEvents: upcomingEvents.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        startTime: event.startTime,
        teamId: event.teamId,
        teamName: event.team?.name ?? null,
        rsvpStatus: event.invitations[0]?.rsvpStatus ?? null,
      })),
    };
  }

  private async getAthleteOverview(userId: string, now: Date): Promise<DashboardOverview> {
    const athlete = await this.prisma.athlete.findUnique({
      where: { userId },
      select: { id: true },
    });
    const athleteId = athlete?.id ?? null;

    const teamLinks = athleteId
      ? await this.prisma.teamAthlete.findMany({
          where: { athleteId },
          select: { teamId: true },
        })
      : [];
    const teamIds = teamLinks.map((link) => link.teamId);

    const [teams, athletes, upcomingEventsCount, upcomingEvents, pendingInvitations] =
      await Promise.all([
        teamIds.length,
        this.countDistinctAthletes(teamIds),
        this.prisma.event.count({
          where: {
            startTime: { gte: now },
            OR: [
              { invitations: { some: { userId } } },
              { teamId: { in: teamIds } },
            ],
          },
        }),
        this.prisma.event.findMany({
          where: {
            startTime: { gte: now },
            OR: [
              { invitations: { some: { userId } } },
              { teamId: { in: teamIds } },
            ],
          },
          orderBy: { startTime: 'asc' },
          take: 5,
          include: {
            team: { select: { name: true } },
            invitations: {
              where: { userId },
              select: { rsvpStatus: true },
            },
          },
        }),
        this.prisma.eventInvitation.count({
          where: { userId, rsvpStatus: RsvpStatus.PENDING },
        }),
      ]);

    return {
      stats: {
        teams,
        athletes,
        upcomingEvents: upcomingEventsCount,
        pendingInvitations,
      },
      upcomingEvents: upcomingEvents.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        startTime: event.startTime,
        teamId: event.teamId,
        teamName: event.team?.name ?? null,
        rsvpStatus: event.invitations[0]?.rsvpStatus ?? null,
      })),
    };
  }

  private async countDistinctAthletes(teamIds: string[]): Promise<number> {
    if (teamIds.length === 0) {
      return 0;
    }
    const links = await this.prisma.teamAthlete.findMany({
      where: { teamId: { in: teamIds } },
      select: { athleteId: true },
    });
    const distinct = new Set(links.map((link) => link.athleteId));
    return distinct.size;
  }
}
