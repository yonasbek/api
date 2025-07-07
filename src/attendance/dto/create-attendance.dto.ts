import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, ValidateNested, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../entities/attendance.entity';

export class LocationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

export class CheckInOutDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  timestamp: Date;

  @ApiProperty()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty()
  location: LocationDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateAttendanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => CheckInOutDto)
  @IsOptional()
  check_in?: CheckInOutDto;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => CheckInOutDto)
  @IsOptional()
  check_out?: CheckInOutDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  leave_type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  leave_reason?: string;
} 