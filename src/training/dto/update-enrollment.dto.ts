import { IsOptional, IsEnum, IsInt, IsNumber, IsString, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../entities/course-enrollment.entity';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ description: 'Enrollment status', enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ description: 'Progress percentage (0-100)', example: 75 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress_percentage?: number;

  @ApiPropertyOptional({ description: 'Final grade' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  final_grade?: number;

  @ApiPropertyOptional({ description: 'Certificate URL' })
  @IsOptional()
  @IsString()
  certificate_url?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Feedback' })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({ description: 'Attendance count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  attendance_count?: number;

  @ApiPropertyOptional({ description: 'Total sessions' })
  @IsOptional()
  @IsInt()
  @Min(0)
  total_sessions?: number;

  @ApiPropertyOptional({ description: 'Amount paid' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount_paid?: number;

  @ApiPropertyOptional({ description: 'Payment date' })
  @IsOptional()
  @IsDateString()
  payment_date?: Date;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Payment reference' })
  @IsOptional()
  @IsString()
  payment_reference?: string;

  @ApiPropertyOptional({ description: 'Started at date' })
  @IsOptional()
  @IsDateString()
  started_at?: Date;

  @ApiPropertyOptional({ description: 'Completed at date' })
  @IsOptional()
  @IsDateString()
  completed_at?: Date;
}
