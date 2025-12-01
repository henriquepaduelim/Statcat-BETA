import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { EventType } from '../../common/enums/event-type.enum';

export class ListEventsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsString()
  teamId?: string;
}
