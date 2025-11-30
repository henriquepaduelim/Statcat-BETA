import { Module } from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { AthletesController } from './athletes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { AthleteScopeGuard } from '../common/guards/athlete-scope.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AthletesController],
  providers: [AthletesService, RolesGuard, AthleteScopeGuard],
  exports: [AthletesService],
})
export class AthletesModule {}
