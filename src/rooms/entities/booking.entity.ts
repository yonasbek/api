import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Room } from './room.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum AttendeeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity('bookings')
export class Booking extends BaseEntity {
  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ApiProperty({ example: 'room-123' })
  @Column()
  room_id: string;

  @ApiProperty({ example: 'Team Planning Meeting' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Monthly team planning and review' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  @Column('timestamp')
  start_time: Date;

  @ApiProperty({ example: '2024-01-01T11:00:00Z' })
  @Column('timestamp')
  end_time: Date;

  @ApiProperty({
    example: [
      {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'pending',
      },
    ],
  })
  @Column('json', { default: [] })
  attendees: Array<{
    id: string;
    name: string;
    email: string;
    status: AttendeeStatus;
  }>;

  @ApiProperty({ example: true })
  @Column({ default: false })
  is_recurring: boolean;

  @ApiProperty({
    example: {
      frequency: 'weekly',
      interval: 1,
      endDate: '2024-12-31T00:00:00Z',
    },
    nullable: true,
  })
  @Column('json', { nullable: true })
  recurring_pattern: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate: string;
  } | null;

  @ApiProperty({
    example: [
      {
        id: 'resource-123',
        name: 'Projector',
        quantity: 1,
      },
    ],
  })
  @Column('json', { default: [] })
  resources: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}
