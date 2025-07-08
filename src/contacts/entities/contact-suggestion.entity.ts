import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Contact } from './contact.entity';
import { User } from '../../users/entities/user.entity';

export enum SuggestionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SuggestionType {
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ADD = 'ADD'
}

@Entity('contact_suggestions')
export class ContactSuggestion extends BaseEntity {
  @ApiProperty({ example: 'contact-id-here' })
  @Column({ nullable: true })
  contact_id?: string;

  @ManyToOne(() => Contact, { nullable: true, eager: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @ApiProperty({ example: 'user-id-here' })
  @Column()
  suggested_by_user_id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'suggested_by_user_id' })
  suggestedBy: User;

  @ApiProperty({ enum: SuggestionType, example: SuggestionType.UPDATE })
  @Column({
    type: 'enum',
    enum: SuggestionType
  })
  suggestionType: SuggestionType;

  @ApiProperty({ enum: SuggestionStatus, example: SuggestionStatus.PENDING })
  @Column({
    type: 'enum',
    enum: SuggestionStatus,
    default: SuggestionStatus.PENDING
  })
  status: SuggestionStatus;

  @ApiProperty({ example: 'The phone number has changed' })
  @Column()
  reason: string;

  @ApiProperty({ 
    example: '{"phoneNumber": "+251922334455", "emailAddress": "new.email@moh.gov.et"}',
    description: 'JSON object containing the suggested changes'
  })
  @Column({ type: 'json', nullable: true })
  suggestedChanges?: object;

  @ApiProperty({ example: 'user-id-here', required: false })
  @Column({ nullable: true })
  reviewed_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy?: User;

  @ApiProperty({ example: new Date(), required: false })
  @Column({ nullable: true })
  reviewedAt?: Date;

  @ApiProperty({ example: 'Changes approved and applied', required: false })
  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;
} 