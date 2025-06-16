import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  confirmPassword: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+251912345678' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'Manager' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: 'department-uuid' })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'role-uuid' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ example: 'Jane Smith', required: false })
  @IsOptional()
  @IsString()
  supervisorName?: string;

  @ApiProperty({ example: 'Some notes', required: false })
  @IsOptional()
  @IsString()
  comments?: string;
} 