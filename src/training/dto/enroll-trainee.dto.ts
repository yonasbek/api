import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollTraineeDto {
  @ApiProperty({ description: 'Course ID to enroll in' })
  @IsString()
  course_id: string;

  @ApiProperty({ description: 'Trainee ID to enroll' })
  @IsString()
  trainee_id: string;

  @ApiPropertyOptional({
    description: 'Whether attendance is required',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  attendance_required?: boolean;

  @ApiPropertyOptional({ description: 'Total number of sessions', default: 0 })
  @IsOptional()
  total_sessions?: number;

  @ApiPropertyOptional({
    description: 'Whether payment is required',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  payment_required?: boolean;

  @ApiPropertyOptional({ description: 'Amount to be paid' })
  @IsOptional()
  @IsNumber()
  amount_paid?: number;

  @ApiPropertyOptional({
    description: 'Payment method',
    example: 'Credit Card',
  })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsOptional()
  @IsString()
  payment_reference?: string;

  @ApiPropertyOptional({ description: 'Additional notes for enrollment' })
  @IsOptional()
  @IsString()
  notes?: string;
}
