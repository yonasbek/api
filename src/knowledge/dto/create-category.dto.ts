import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Programming' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Articles related to programming and software development',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'code' })
  @IsString()
  @IsOptional()
  icon?: string;
}
