import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ActivityComment } from './activity-comment.entity';
import { ActivityAttachment } from './activity-attachment.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PlanType {
  PFRD = 'PFRD',
  ECCD = 'ECCD',
  HDD = 'HDD',
  SRD = 'SRD'
}

export enum ActivityStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED'
}

@Entity('activities')
export class Activity extends BaseEntity {
  @ApiProperty({ enum: PlanType, example: PlanType.PFRD })
  @Column({
    type: 'enum',
    enum: PlanType
  })
  plan_type: PlanType;

  @ApiProperty({ example: '2024' })
  @Column()
  plan_year: string;

  @ApiProperty({ example: 'Implement New Patient Registration System' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Improve patient experience and reduce waiting times' })
  @Column()
  strategic_objective: string;

  @ApiProperty({ example: 'IT Department' })
  @Column()
  responsible_department: string;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  assigned_person: string;

  @ApiProperty({ example: '2024-01-01' })
  @Column('date')
  start_date: Date;

  @ApiProperty({ example: '2024-12-31' })
  @Column('date')
  end_date: Date;

  @ApiProperty({ example: 50000 })
  @Column('int', { default: 0 })
  budget_allocated: number;

  @ApiProperty({ example: 0})
  @Column('int', { default: 0 })
  budget_spent: number;

  @ApiProperty({ enum: ActivityStatus, example: ActivityStatus.NOT_STARTED })
  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.NOT_STARTED
  })
  status: ActivityStatus;

  @ApiProperty({ example: 25 })
  @Column('int', { default: 0 })
  progress: number;

  @ApiProperty({ example: 'Vendor selection in progress' })
  @Column('text', { nullable: true })
  remarks: string;

  @ApiProperty({ example: ['proposal.pdf', 'timeline.xlsx'] })
  @Column('simple-array', { nullable: true })
  supporting_documents: string[];

  @ManyToOne(() => Plan, plan => plan.activities)
  plan: Plan;

  @Column()
  plan_id: string;

  @OneToMany(() => ActivityComment, comment => comment.activity)
  comments: ActivityComment[];

  @OneToMany(() => ActivityAttachment, attachment => attachment.activity)
  attachments: ActivityAttachment[];

  @OneToMany(() => Reminder, reminder => reminder.activity)
  reminders: Reminder[];
} 