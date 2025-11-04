import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Activity } from './activity.entity';
import { User } from '../../users/entities/user.entity';
import { Week } from './week.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ActivityStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    DELAYED = 'DELAYED'
  }

@Entity('subactivities')
export class SubActivity extends BaseEntity {
  @ApiProperty({ example: 'Setup database schema' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Create and configure the database tables and relationships' })
  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column()
  user_id: string;

  @ManyToOne(() => Week, { eager: true })
  @JoinColumn({ name: 'start_week_id' })
  start_week: Week;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column({ nullable: true })
  start_week_id: string;

  @ManyToOne(() => Week, { eager: true })
  @JoinColumn({ name: 'end_week_id' })
  end_week: Week;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column({ nullable: true })
  end_week_id: string;

  @ApiProperty({ enum: ActivityStatus})
  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.NOT_STARTED
  })
  status: ActivityStatus;

  @ApiProperty({ example: 25 })
  @Column('int', { default: 0 })
  progress: number;

  @ApiProperty({ example: 'Initial setup completed' })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ example: 'High' })
  @Column({ default: 'Medium' })
  priority: string;

  @ManyToOne(() => Activity, activity => activity.subactivities)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column()
  activity_id: string;

  @Column({ nullable: true })
  weight?: number;
} 