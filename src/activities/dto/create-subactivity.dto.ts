import { IsString, IsNotEmpty, IsDate, IsEnum, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityStatus } from '../entities/activity.entity';

export class CreateSubActivityDto {
  @ApiProperty({ example: 'Setup database schema' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Create and configure the database tables and relationships' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: '2024-01-01' })
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @ApiProperty({ example: '2024-01-15' })
  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @ApiProperty({ enum: ActivityStatus, example: ActivityStatus.NOT_STARTED })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiProperty({ example: 'Initial setup completed' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'High' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  activity_id: string;
  
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  weight?: number;
} 
