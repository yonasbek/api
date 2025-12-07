import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum AdHocTaskStatus {
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

@Entity('adhoc_tasks')
export class AdHocTask extends BaseEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column('uuid')
  plan_id: string;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @ApiProperty({ example: 'Prepare quarterly report' })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Compile data and draft the report',
    required: false,
  })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ example: '2025-01-15T12:00:00Z', required: false })
  @Column('timestamp with time zone', { nullable: true })
  due_date?: Date;

  @ApiProperty({ enum: AdHocTaskStatus, example: AdHocTaskStatus.TO_DO })
  @Column({
    type: 'enum',
    enum: AdHocTaskStatus,
    default: AdHocTaskStatus.TO_DO,
  })
  status: AdHocTaskStatus;
}
