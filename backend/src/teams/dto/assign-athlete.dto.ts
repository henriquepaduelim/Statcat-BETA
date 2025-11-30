import { IsString } from 'class-validator';

export class AssignAthleteDto {
  @IsString()
  athleteId!: string;
}
