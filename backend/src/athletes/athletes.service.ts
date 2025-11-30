import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';
import type { Athlete } from '@prisma/client';

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

  async findAll(): Promise<Athlete[]> {
    return this.prisma.athlete.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
