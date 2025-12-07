import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { MemoSignature } from './memo-signature.entity';
import { MemoStatus } from '../dto/create-memo.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum MemoType {
  GENERAL = 'GENERAL',
  INSTRUCTIONAL = 'INSTRUCTIONAL',
  INFORMATIONAL = 'INFORMATIONAL',
}

export enum PriorityLevel {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  CONFIDENTIAL = 'CONFIDENTIAL',
}

@Entity('memos')
export class Memo extends BaseEntity {
  @ApiProperty({ example: 'Budget Review Meeting Minutes' })
  @Column()
  title: string;

  @ApiProperty({ enum: MemoType, example: MemoType.GENERAL })
  @Column({
    type: 'enum',
    enum: MemoType,
    default: MemoType.GENERAL,
  })
  memo_type: MemoType;

  @ApiProperty({ example: 'Finance' })
  @Column()
  department: string;

  @ApiProperty({ example: '<p>Meeting discussion points...</p>' })
  @Column('text')
  body: string;

  @ApiProperty({ example: ['document.pdf'] })
  @Column('simple-array', { nullable: true })
  attachments: string[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'memo_recipients',
    joinColumn: { name: 'memo_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  recipients: User[];

  @ApiProperty({ example: '2024-03-14' })
  @Column('date')
  date_of_issue: Date;

  @ApiProperty({ enum: PriorityLevel, example: PriorityLevel.NORMAL })
  @Column({
    type: 'enum',
    enum: PriorityLevel,
    default: PriorityLevel.NORMAL,
  })
  priority_level: PriorityLevel;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  signature: string;

  @ApiProperty({ enum: MemoStatus, example: MemoStatus.DRAFT })
  @Column({
    type: 'enum',
    enum: MemoStatus,
    default: MemoStatus.DRAFT,
  })
  status: MemoStatus;

  @ApiProperty({ example: ['budget.pdf', 'forecast.xlsx'] })
  @Column('text', { array: true, nullable: true })
  tags?: string[];

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  @Column('timestamp with time zone', { nullable: true })
  approved_at?: Date;

  // Workflow fields
  @ApiProperty({ example: 'This memo looks good, sending to LEO' })
  @Column('text', { nullable: true })
  desk_head_comment?: string;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  @Column('timestamp with time zone', { nullable: true })
  desk_head_reviewed_at?: Date;

  @ManyToOne(() => User, { nullable: true })
  desk_head_reviewer?: User;

  @ApiProperty({ example: 'Approved for publication' })
  @Column('text', { nullable: true })
  leo_comment?: string;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  @Column('timestamp with time zone', { nullable: true })
  leo_reviewed_at?: Date;

  @ManyToOne(() => User, { nullable: true })
  leo_reviewer?: User;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  @Column('timestamp with time zone', { nullable: true })
  submitted_to_desk_head_at?: Date;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  @Column('timestamp with time zone', { nullable: true })
  submitted_to_leo_at?: Date;

  @OneToMany(() => MemoSignature, (signature) => signature.memo)
  signatures: MemoSignature[];
}
