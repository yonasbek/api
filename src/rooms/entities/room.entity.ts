import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Booking } from './booking.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity('rooms')
export class Room extends BaseEntity {
  @ApiProperty({ example: 'Conference Room A' })
  @Column()
  name: string;

  @ApiProperty({ example: 20 })
  @Column('int')
  capacity: number;

  @ApiProperty({ example: '1st Floor' })
  @Column()
  floor: string;

  @ApiProperty({ enum: RoomStatus, example: RoomStatus.AVAILABLE })
  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  status: RoomStatus;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        icon: { type: 'string' },
      },
    },
    example: [{ id: '1', name: 'Projector', icon: 'projector' }],
  })
  @Column('jsonb', { default: [] })
  facilities: Array<{
    id: string;
    name: string;
    icon: string;
  }>;

  @ApiProperty({ example: 'Spacious room with natural lighting' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ example: 'https://example.com/room.jpg' })
  @Column('text', { nullable: true })
  image: string;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
