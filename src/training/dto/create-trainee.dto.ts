import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTraineeDto {
  @ApiProperty({ description: 'Name of the trainee', example: 'Jane Smith' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Phone number of the trainee',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Email address of the trainee',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Whether the trainee is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
