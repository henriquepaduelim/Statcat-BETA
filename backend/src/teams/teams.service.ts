import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Prisma } from '@prisma/client';
import type { Role, Team } from '@prisma/client';
import { ListTeamsDto } from './dto/list-teams.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamDto): Promise<Team> {
    try {
      return await this.prisma.team.create({
        data: {
          name: dto.name,
          ageGroup: dto.ageGroup,
          status: dto.status,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new ConflictException('Team name already exists');
      }
      throw error;
    }
  }

  async findAllForUser(userId: string, role: Role, query: ListTeamsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (role === 'ADMIN' || role === 'STAFF') {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.team.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.team.count({ where }),
      ]);
      return { items, total, page, pageSize };
    }

    if (role === 'COACH') {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.team.findMany({
          where: {
            ...where,
            coaches: { some: { coachId: userId } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.team.count({
          where: {
            ...where,
            coaches: { some: { coachId: userId } },
          },
        }),
      ]);
      return { items, total, page, pageSize };
    }

    // Athlete
    const athlete = await this.prisma.athlete.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!athlete) {
      return { items: [], total: 0, page, pageSize };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.team.findMany({
        where: {
          ...where,
          athletes: { some: { athleteId: athlete.id } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.team.count({
        where: {
          ...where,
          athletes: { some: { athleteId: athlete.id } },
        },
      }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    await this.ensureExists(id);
    try {
      return await this.prisma.team.update({
        where: { id },
        data: {
          name: dto.name,
          ageGroup: dto.ageGroup,
          status: dto.status,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new ConflictException('Team name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.team.delete({ where: { id } });
  }

  async addAthlete(teamId: string, athleteId: string): Promise<void> {
    await this.ensureExists(teamId);
    await this.prisma.teamAthlete.upsert({
      where: { teamId_athleteId: { teamId, athleteId } },
      create: { teamId, athleteId },
      update: {},
    });
  }

  async removeAthlete(teamId: string, athleteId: string): Promise<void> {
    try {
      await this.prisma.teamAthlete.delete({
        where: { teamId_athleteId: { teamId, athleteId } },
      });
    } catch (error) {
      if (this.isNotFound(error)) {
        throw new NotFoundException('Athlete not found on this team');
      }
      throw error;
    }
  }

  async addCoach(teamId: string, coachId: string): Promise<void> {
    await this.ensureExists(teamId);
    await this.prisma.teamCoach.upsert({
      where: { teamId_coachId: { teamId, coachId } },
      create: { teamId, coachId },
      update: {},
    });
  }

  async removeCoach(teamId: string, coachId: string): Promise<void> {
    try {
      await this.prisma.teamCoach.delete({
        where: { teamId_coachId: { teamId, coachId } },
      });
    } catch (error) {
      if (this.isNotFound(error)) {
        throw new NotFoundException('Coach not found on this team');
      }
      throw error;
    }
  }

  async roster(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        athletes: {
          include: {
            athlete: true,
          },
        },
        coaches: {
          include: {
            coach: true,
          },
        },
      },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return {
      team: {
        id: team.id,
        name: team.name,
        ageGroup: team.ageGroup,
        status: team.status,
      },
      athletes: team.athletes.map((item) => item.athlete),
      coaches: team.coaches.map((item) => item.coach),
    };
  }

  private async ensureExists(id: string): Promise<void> {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
  }

  private isUniqueConstraint(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private isNotFound(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }
}
