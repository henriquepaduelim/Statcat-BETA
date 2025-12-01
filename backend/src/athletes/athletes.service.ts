import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';
import type { Athlete } from '@prisma/client';
import { ListAthletesDto } from './dto/list-athletes.dto';
import { Role } from '../common/enums/role.enum';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Injectable()
export class AthletesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAthleteDto): Promise<Athlete> {
    return this.prisma.athlete.create({
      data: {
        userId: dto.userId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        position: dto.position,
        dominantFoot: dto.dominantFoot,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async findAll(query: ListAthletesDto, user: JwtPayload) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { id: { contains: query.search, mode: 'insensitive' } },
        { position: { contains: query.search, mode: 'insensitive' } },
        {
          user: {
            email: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }
    if (query.teamId) {
      where.teams = { some: { teamId: query.teamId } };
    }

    // Scope: admin/staff see all; coach/athlete cannot hit this controller (guard)
    if (user.role === Role.COACH) {
      where.teams = {
        some: {
          team: {
            coaches: { some: { coachId: user.sub } },
          },
        },
      };
    }
    if (user.role === Role.ATHLETE) {
      where.userId = user.sub;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.athlete.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.athlete.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string): Promise<Athlete> {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id },
    });
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
    return athlete;
  }

  async update(id: string, dto: UpdateAthleteDto): Promise<Athlete> {
    await this.ensureExists(id);
    return this.prisma.athlete.update({
      where: { id },
      data: {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        position: dto.position,
        dominantFoot: dto.dominantFoot,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.athlete.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const athlete = await this.prisma.athlete.findUnique({ where: { id } });
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
  }
}
