import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsArray } from 'class-validator';
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
  @IsOptional()
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

  @ApiProperty({ example: 'ETB', description: 'Currency code (e.g., ETB, USD, EUR)' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: ['internal', 'donor'], description: 'Budget sources: internal, donor, government, partner' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  budget_source?: string[];
} 