import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RoomStatus } from '../entities/room.entity';

class FacilityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  icon: string;
}

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  floor: string;

  @ApiProperty({ enum: RoomStatus })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @ApiProperty({ type: [FacilityDto] })
  @ValidateNested({ each: true })
  @Type(() => FacilityDto)
  @IsArray()
  @IsOptional()
  facilities?: FacilityDto[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image?: string;
} 