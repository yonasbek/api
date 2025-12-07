import { IsString, IsNotEmpty, IsNumber, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIndicatorDto {
  @ApiProperty({ example: 'Patient Satisfaction Rate' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'percentage' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 95.0 })
  @IsDecimal()
  target_value: number;

  @ApiProperty({ example: 87.5 })
  @IsDecimal()
  current_value: number;

  @ApiProperty({ example: 'Patient Care' })
  @IsString()
  @IsNotEmpty()
  category: string;
}
