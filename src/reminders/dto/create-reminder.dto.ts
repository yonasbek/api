import { IsString, IsNotEmpty, IsDate, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty({ example: 'Complete activity review' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  @Type(() => Date)
  @IsDate()
  reminder_date: Date;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_sent: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  activity_id: string;
} 