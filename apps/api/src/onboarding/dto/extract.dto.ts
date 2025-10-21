import { IsString } from 'class-validator';

export class ExtractProfileDto {
  @IsString()
  sessionId!: string;

  @IsString()
  userId!: string;
}
