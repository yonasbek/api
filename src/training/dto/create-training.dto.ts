import { IsString, IsNotEmpty, IsDate, IsEnum, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TrainingType, TrainingLocation } from '../entities/training.entity';

export class CreateTrainingDto {
  @ApiProperty({ example: 'Advanced Medical Training', description: 'Training title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'workshop', enum: TrainingType, description: 'Type of training' })
  @IsEnum(TrainingType)
  @IsNotEmpty()
  type: TrainingType;

  @ApiProperty({ example: 'local', enum: TrainingLocation, description: 'Training location type' })
  @IsEnum(TrainingLocation)
  @IsNotEmpty()
  location_type: TrainingLocation;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia', description: 'Training location address' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'United States', description: 'Country for abroad trainings' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: '2024-01-15', description: 'Training start date' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty({ example: '2024-01-20', description: 'Training end date' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  end_date: Date;

  @ApiProperty({ example: 'Dr. John Doe', description: 'Training organizer/instructor' })
  @IsString()
  @IsOptional()
  organizer?: string;

  @ApiProperty({ example: 'Comprehensive training on advanced medical procedures', description: 'Training description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['trip_report.pdf'], description: 'Trip report file names' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  trip_report?: string[];

  @ApiProperty({ example: ['photo1.jpg'], description: 'Photo file names' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({ example: ['attendance.pdf'], description: 'Attendance file names' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attendance?: string[];

  @ApiProperty({ example: ['letter.pdf'], description: 'Additional letter file names' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additional_letter?: string[];

  @ApiProperty({ example: 25, description: 'Number of participants' })
  @IsNumber()
  @IsOptional()
  participants_count?: number;

  @ApiProperty({ example: 'Completed successfully', description: 'Training status or remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

