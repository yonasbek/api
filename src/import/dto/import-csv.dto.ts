import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ImportCsvDto {
  @ApiProperty({ example: 'Employee Data Import' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Employee data import for Q1 2024' })
  @IsOptional()
  @IsString()
  description?: string;
}
