import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TeamStatus } from '../../common/enums/team-status.enum';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  ageGroup?: string;

  @IsEnum(TeamStatus)
  @IsOptional()
  status?: TeamStatus;
}
