import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ContactType, ContactPosition } from '../enums/contact-type.enum';

export class CreateContactDto {
  @ApiProperty({ 
    example: 'Federal Ministry of Health',
    description: 'Name of the institution/organization'
  })
  @IsString()
  instituteName: string;

  @ApiProperty({ 
    example: 'Dr. Yonas Bekele',
    description: 'Full name of the individual'
  })
  @IsString()
  individualName: string;

  @ApiProperty({ 
    enum: ContactPosition, 
    example: ContactPosition.HEAD,
    description: 'Position/title of the individual'
  })
  @IsEnum(ContactPosition)
  position: ContactPosition;

  @ApiProperty({ 
    example: '+251911234567',
    description: 'Primary phone number'
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ 
    example: 'yonas.bekele@moh.gov.et',
    description: 'Email address'
  })
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ 
    enum: ContactType, 
    example: ContactType.MOH_AGENCIES,
    description: 'Type of organization'
  })
  @IsEnum(ContactType)
  organizationType: ContactType;

  @ApiProperty({ 
    example: 'Addis Ababa',
    description: 'Region/city location',
    required: false
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ 
    example: 'Main office building, 3rd floor',
    description: 'Specific location/address',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    example: 'Mon-Fri 8:00-17:00',
    description: 'Available hours',
    required: false
  })
  @IsOptional()
  @IsString()
  availableHours?: string;

  @ApiProperty({ 
    example: true,
    description: 'Whether the contact is active',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    example: 'Additional notes about the contact',
    description: 'Any additional notes',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    example: '+251922345678',
    description: 'Alternative phone number',
    required: false
  })
  @IsOptional()
  @IsString()
  alternativePhone?: string;
}