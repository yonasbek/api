import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MemoType, PriorityLevel } from '../entities/memo.entity';

export enum MemoStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateMemoDto {
  @ApiProperty({ example: 'Budget Review Meeting Minutes' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'GENERAL' })
  @IsString()
  @IsNotEmpty()
  memo_type: MemoType;

  @ApiProperty({ example: 'Finance' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: '<p>Meeting discussion points...</p>' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ example: ['document.pdf'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @ApiProperty({ example: ['user1-id', 'user2-id'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  recipient_ids: string[];

  @ApiProperty({ example: '2024-03-14' })
  @Type(() => Date)
  @IsDate()
  date_of_issue: Date;

  @ApiProperty({ example: 'NORMAL' })
  @IsString()
  @IsOptional()
  priority_level?: PriorityLevel;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  // @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  // @IsUUID()
  // @IsNotEmpty()
  // authorId: string;

  // @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  // @IsArray()
  // @IsUUID('4', { each: true })
  // approverIds: string[];

  @ApiProperty({ example: ['FINANCE', 'BUDGET'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'DRAFT' })
  @IsString()
  @IsNotEmpty()
  status: MemoStatus;
} 