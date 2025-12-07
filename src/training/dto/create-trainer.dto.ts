import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainerDto {
  @ApiProperty({ description: 'Name of the trainer', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Phone number of the trainer',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Email address of the trainer',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Whether the trainer is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
