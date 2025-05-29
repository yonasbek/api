import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  LEAVE = 'leave',
  HOLIDAY = 'holiday'
}

@Entity('attendance')
export class Attendance extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty()
  @Column()
  user_id: string;

  @ApiProperty()
  @Column('date')
  date: Date;

  @ApiProperty({ enum: AttendanceStatus })
  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT
  })
  status: AttendanceStatus;

  @ApiProperty()
  @Column('jsonb', { nullable: true })
  check_in: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    notes?: string;
  };

  @ApiProperty()
  @Column('jsonb', { nullable: true })
  check_out: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    notes?: string;
  };

  @ApiProperty()
  @Column('float', { nullable: true })
  work_hours: number;

  @ApiProperty()
  @Column({ default: false })
  is_late: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  leave_type: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  leave_reason: string;
} 