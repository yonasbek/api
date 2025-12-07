import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

import { ApiProperty } from '@nestjs/swagger';

export enum Module {
  ACTIVITY = 'ACTIVITY',
  PLAN = 'PLAN',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
  MEMO = 'MEMO',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
}

@Entity('uploads')
export class Uploads extends BaseEntity {
  @ApiProperty({ example: 'Annual Development Plan 2024' })
  @Column()
  document_name: string;

  @ApiProperty({ example: 'https://example.com/document.pdf' })
  @Column()
  document_url: string;

  @ApiProperty({ example: 'pdf' })
  @Column({ nullable: true })
  document_type: string;

  @ApiProperty({ example: 100 })
  @Column({ nullable: true })
  document_size: number;

  @ApiProperty({ example: '2024-01-01' })
  @Column({ nullable: true })
  upload_date: Date;

  @ApiProperty({ example: 'Activity' })
  @Column({ nullable: true })
  module: string;
}
