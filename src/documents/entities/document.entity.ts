import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Project Proposal' })
  title: string;

  @Column('text', { nullable: true })
  @ApiProperty({ example: 'Detailed project proposal document' })
  description: string;

  @Column()
  @ApiProperty({ example: 'proposals' })
  category: string;

  @Column()
  @ApiProperty({ example: 'document.pdf' })
  fileName: string;

  @Column()
  @ApiProperty({ example: '/uploads/documents/document.pdf' })
  path: string;

  @Column()
  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @Column('int')
  @ApiProperty({ example: 1024 })
  size: number;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ example: 'user-123' })
  uploadedBy: User;

  @Column()
  @ApiProperty({ example: 'John Doe' })
  originalName: string;

  @OneToMany(() => Comment, comment => comment.document)
  comments: Comment[];

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'document_tag_relations',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags: Tag[];

  @CreateDateColumn()
  @ApiProperty({ example: '2024-01-01T12:00:00' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: '2024-01-01T12:00:00' })
  updatedAt: Date;
} 