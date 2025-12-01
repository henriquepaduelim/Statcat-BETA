import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AthleteStatus } from '../../common/enums/athlete-status.enum';

export class ListAthletesDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AthleteStatus)
  status?: AthleteStatus;

  @IsOptional()
  @IsString()
  teamId?: string;
}
