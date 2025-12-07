import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanType } from '../entities/plan.entity';

export class CreatePlanDto {
  @ApiProperty({ example: 'Annual Development Plan 2024' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2024' })
  @IsString()
  @IsNotEmpty()
  fiscal_year: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({ example: 'PFRD', enum: PlanType })
  @IsEnum(PlanType)
  plan_type: PlanType;

  @ApiProperty({ example: 'draft' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @IsOptional()
  budget_allocated?: number;
}
