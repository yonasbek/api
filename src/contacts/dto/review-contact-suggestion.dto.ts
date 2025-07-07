import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SuggestionStatus } from '../entities/contact-suggestion.entity';

export class ReviewContactSuggestionDto {
  @ApiProperty({ 
    enum: SuggestionStatus, 
    example: SuggestionStatus.APPROVED,
    description: 'Decision on the suggestion'
  })
  @IsEnum(SuggestionStatus)
  status: SuggestionStatus;

  @ApiProperty({ 
    example: 'Changes approved and applied to the contact record',
    description: 'Review notes explaining the decision',
    required: false
  })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
} 