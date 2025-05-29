import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Activity } from './activity.entity';

@Entity('activity_comments')
export class ActivityComment extends BaseEntity {
  @Column()
  content: string;

  @Column()
  user_id: string;

  @Column()
  user_name: string;

  @Column()
  activity_id: string;

  @ManyToOne(() => Activity, activity => activity.comments)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;
} 