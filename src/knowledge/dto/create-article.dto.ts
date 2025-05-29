import { IsString, IsNotEmpty, IsUUID, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'Introduction to TypeScript' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'TypeScript is a typed superset of JavaScript...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'A brief overview of TypeScript basics' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  authorId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({ example: ['typescript.pdf', 'code-examples.zip'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
} 