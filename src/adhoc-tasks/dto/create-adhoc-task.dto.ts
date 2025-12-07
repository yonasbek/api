import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { AdHocTaskStatus } from '../entities/adhoc-task.entity';

export class CreateAdHocTaskDto {
  @ApiProperty({ example: 'Prepare quarterly report' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Compile data and draft the report',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-01-15T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({
    enum: AdHocTaskStatus,
    example: AdHocTaskStatus.TO_DO,
    required: false,
  })
  @IsOptional()
  @IsEnum(AdHocTaskStatus)
  status?: AdHocTaskStatus;
}
