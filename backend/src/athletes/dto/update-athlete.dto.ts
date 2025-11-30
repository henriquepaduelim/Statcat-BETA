import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AthleteStatus } from '../../common/enums/athlete-status.enum';
import { DominantFoot } from '../../common/enums/dominant-foot.enum';

export class UpdateAthleteDto {
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(DominantFoot)
  @IsOptional()
  dominantFoot?: DominantFoot;

  @IsEnum(AthleteStatus)
  @IsOptional()
  status?: AthleteStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
