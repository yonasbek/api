import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { SuggestionType } from '../entities/contact-suggestion.entity';

export class CreateContactSuggestionDto {
  @ApiProperty({ 
    example: 'contact-id-here',
    description: 'ID of the contact to suggest changes for (null for new contact suggestions)',
    required: false
  })
  @IsOptional()
  @IsString()
  contact_id?: string;

  @ApiProperty({ 
    enum: SuggestionType, 
    example: SuggestionType.UPDATE,
    description: 'Type of suggestion'
  })
  @IsEnum(SuggestionType)
  suggestionType: SuggestionType;

  @ApiProperty({ 
    example: 'The phone number has changed and email is outdated',
    description: 'Reason for the suggestion'
  })
  @IsString()
  reason: string;

  @ApiProperty({ 
    example: {
      phoneNumber: '+251922334455',
      emailAddress: 'new.email@moh.gov.et',
      notes: 'Updated contact information as of January 2024'
    },
    description: 'JSON object containing the suggested changes or new contact data',
    required: false
  })
  @IsOptional()
  @IsObject()
  suggestedChanges?: Record<string, any>;
} 