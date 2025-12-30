import { IsString, IsNotEmpty, IsDate, IsEnum, IsNumber, IsUUID, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityStatus, PlanType } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ enum: PlanType, example: PlanType.PFRD })
  @IsEnum(PlanType)
  @IsNotEmpty()
  plan_type: PlanType;

  @ApiProperty({ example: '2024' })
  @IsString()
  @IsNotEmpty()
  plan_year: string;

  @ApiProperty({ example: 'Implement New Patient Registration System' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Improve patient experience and reduce waiting times' })
  @IsString()
  @IsNotEmpty()
  strategic_objective: string;

  @ApiProperty({ example: 'IT Department' })
  @IsString()
  @IsOptional()
  responsible_department?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  assigned_person: string;

  @ApiProperty({ example: '2024-01-01' })
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @ApiProperty({ example: '2024-12-31' })
  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @ApiProperty({ example: 50000.00 })
  @IsNumber()
  budget_allocated: number;

  @ApiProperty({ enum: ActivityStatus, example: ActivityStatus.NOT_STARTED })
  @IsEnum(ActivityStatus)
  status: ActivityStatus;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiProperty({ example: 'Vendor selection in progress' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ example: ['proposal.pdf', 'timeline.xlsx'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supporting_documents?: string[];

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  plan_id: string;

  @ApiProperty({ example: false, description: 'Whether this is a flagship activity' })
  @IsBoolean()
  @IsOptional()
  flagship_activity?: boolean;
} 