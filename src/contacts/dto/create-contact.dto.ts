import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Yonas Bekele' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Software developer' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: 'external' })
  @IsString()
  department: string;

  @ApiProperty({ example: '+251923273069' })
  @IsString()
  officePhone: string;

  @ApiProperty({ example: '+251923273069', required: false })
  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @ApiProperty({ example: 'yonasbek4@gmail.com' })
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ example: 'Addis Ababa, ETH', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '2025-05-29T07:47', required: false })
  @IsString()
  @IsOptional()
  availableHour?: string;

  @ApiProperty({ example: 'desc', required: false })
  @IsString()
  @IsOptional()
  availableHourDesc?: string;

  @ApiProperty({ example: 'partner' })
  @IsString()
  category: string;
}