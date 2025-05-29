import { IsString, IsNotEmpty, IsDateString, IsUUID, IsOptional, IsBoolean, ValidateNested, IsArray, IsNumber, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AttendeeStatus } from '../entities/booking.entity';

class AttendeeDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: AttendeeStatus })
  @IsEnum(AttendeeStatus)
  @IsNotEmpty()
  status: AttendeeStatus;
}

class ResourceDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

class RecurringPatternDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] })
  @IsString()
  @IsNotEmpty()
  frequency: 'daily' | 'weekly' | 'monthly';

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  interval: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  room_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  attendee_ids: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_recurring?: boolean;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => RecurringPatternDto)
  @IsOptional()
  recurring_pattern?: RecurringPatternDto;

  @ApiProperty({ type: [ResourceDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  @IsArray()
  @IsOptional()
  resources?: ResourceDto[];
} 