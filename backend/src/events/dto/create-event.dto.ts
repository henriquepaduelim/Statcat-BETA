import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventType } from '../../common/enums/event-type.enum';

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inviteeIds?: string[];
}
