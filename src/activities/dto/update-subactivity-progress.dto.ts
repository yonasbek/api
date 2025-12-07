import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityStatus } from '../entities/activity.entity';

export class UpdateSubActivityProgressDto {
  @ApiProperty({ example: 75 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({ enum: ActivityStatus, example: ActivityStatus.IN_PROGRESS })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiProperty({ example: 'Progress update: completed database setup' })
  @IsString()
  @IsOptional()
  notes?: string;
}
