import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Document } from './document.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('comments')
export class Comment extends BaseEntity {
  @ApiProperty({ example: 'Great document, but needs some revisions.' })
  @Column('text')
  message: string;

  @ManyToOne(() => Document, (document) => document.comments)
  document: Document;

  @ManyToOne(() => User)
  user: User;
}
