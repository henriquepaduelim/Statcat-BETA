import { IsEnum } from 'class-validator';
import { RsvpStatus } from '../../common/enums/rsvp-status.enum';

export class RsvpDto {
  @IsEnum(RsvpStatus)
  status!: RsvpStatus;
}
