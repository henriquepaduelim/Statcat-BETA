import { Module } from '@nestjs/common';
import { PlayerProfileService } from './player-profile.service';
import { PlayerProfileController } from './player-profile.controller';

@Module({
  controllers: [PlayerProfileController],
  providers: [PlayerProfileService],
})
export class PlayerProfileModule {}
