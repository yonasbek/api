import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('reminders')
export class Reminder extends BaseEntity {
  @ApiProperty({ example: 'Complete activity review' })
  @Column('text')
  message: string;

  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  @Column('timestamp')
  reminder_date: Date;

  @ApiProperty({ example: false })
  @Column({ default: false })
  is_sent: boolean;

  @ManyToOne(() => Activity, (activity) => activity.reminders)
  activity: Activity;
}
