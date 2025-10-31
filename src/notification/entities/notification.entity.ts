// src/notification/entities/notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubActivity } from '../../activities/entities/subactivity.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  message: string;

  @Column({ length: 50, nullable: true })
  category: string; // e.g., 'due_soon', 'overdue', etc.

  @ManyToOne(() => SubActivity, { onDelete: 'CASCADE' })
  related_task: SubActivity;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
