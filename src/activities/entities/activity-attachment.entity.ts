import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Activity } from './activity.entity';

@Entity('activity_attachments')
export class ActivityAttachment extends BaseEntity {
  @Column()
  file_name: string;

  @Column()
  file_path: string;

  @Column()
  file_type: string;

  @Column()
  file_size: number;

  @Column()
  activity_id: string;

  @ManyToOne(() => Activity, activity => activity.attachments)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;
} 