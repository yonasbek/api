import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'TypeScript' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Articles related to TypeScript programming language',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
