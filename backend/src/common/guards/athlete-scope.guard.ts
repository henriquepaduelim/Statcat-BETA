import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class AthleteScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub: string; role: Role } | undefined;
    const athleteId: string | undefined = request.params?.id;

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    if (!athleteId) {
      throw new ForbiddenException('Athlete id is required');
    }

    if (user.role === Role.ADMIN || user.role === Role.STAFF) {
      return true;
    }

    if (user.role === Role.ATHLETE) {
      const athlete = await this.prisma.athlete.findUnique({
        where: { id: athleteId },
      });
      if (!athlete || athlete.userId !== user.sub) {
        throw new ForbiddenException('Access denied to athlete profile');
      }
      return true;
    }

    if (user.role === Role.COACH) {
      const membership = await this.prisma.teamAthlete.findFirst({
        where: {
          athleteId,
          team: {
            coaches: {
              some: { coachId: user.sub },
            },
          },
        },
      });
      if (!membership) {
        throw new ForbiddenException('Coach not assigned to athlete team');
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}
