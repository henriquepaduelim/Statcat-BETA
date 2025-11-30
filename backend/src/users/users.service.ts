import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { Role } from '../common/enums/role.enum';
import type { User } from '@prisma/client';
import { hash } from 'bcryptjs';

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role ?? Role.ATHLETE,
        status: dto.status ?? UserStatus.PENDING,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
    return this.toSafeUser(user);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user: User) => this.toSafeUser(user));
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toSafeUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await this.hashPassword(dto.password);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? user.email,
        passwordHash: passwordHash ?? user.passwordHash,
        role: dto.role ?? user.role,
        status: dto.status ?? user.status,
        firstName: dto.firstName ?? user.firstName,
        lastName: dto.lastName ?? user.lastName,
      },
    });
    return this.toSafeUser(updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return hash(password, saltRounds);
  }

  private toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
