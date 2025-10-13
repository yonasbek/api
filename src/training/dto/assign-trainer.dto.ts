import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTrainerDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  course_id: string;

  @ApiProperty({ description: 'Array of trainer IDs to assign', type: [String] })
  @IsArray()
  @IsString({ each: true })
  trainer_ids: string[];
}



