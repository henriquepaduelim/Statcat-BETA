import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class TeamScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub: string; role: Role } | undefined;
    const teamId: string | undefined =
      request.params?.id ?? request.params?.teamId;

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    if (!teamId) {
      throw new ForbiddenException('Team id is required');
    }

    if (user.role === Role.ADMIN || user.role === Role.STAFF) {
      return true;
    }

    if (user.role === Role.COACH) {
      const coachAssigned = await this.prisma.teamCoach.findUnique({
        where: { teamId_coachId: { teamId, coachId: user.sub } },
      });
      if (!coachAssigned) {
        throw new ForbiddenException('Coach not assigned to this team');
      }
      return true;
    }

    if (user.role === Role.ATHLETE) {
      const athlete = await this.prisma.athlete.findUnique({
        where: { userId: user.sub },
      });
      if (!athlete) {
        throw new ForbiddenException('Athlete profile not found');
      }
      const athleteAssigned = await this.prisma.teamAthlete.findUnique({
        where: { teamId_athleteId: { teamId, athleteId: athlete.id } },
      });
      if (!athleteAssigned) {
        throw new ForbiddenException('Athlete not assigned to this team');
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}
