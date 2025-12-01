import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TeamStatus } from '../../common/enums/team-status.enum';

export class ListTeamsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}
