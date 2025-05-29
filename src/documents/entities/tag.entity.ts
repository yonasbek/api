import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Document } from './document.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tags')
export class Tag extends BaseEntity {
  @ApiProperty({ example: 'Important' })
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Document, document => document.tags)
  documents: Document[];
} 