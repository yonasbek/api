import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Booking } from './entities/booking.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create({
      ...createRoomDto,
      status: RoomStatus.AVAILABLE,
      facilities: createRoomDto.facilities?.map(f => ({
        id: f.id,
        name: f.name,
        icon: f.icon
      })) || []
    });
    return await this.roomRepository.save(room as Room);
  }

  async findAllRooms(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOneRoom(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async updateRoom(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOneRoom(id);
    if (updateRoomDto.facilities) {
      updateRoomDto.facilities = updateRoomDto.facilities.map(f => ({
        id: f.id,
        name: f.name,
        icon: f.icon
      }));
    }
    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async deleteRoom(id: string): Promise<void> {
    const result = await this.roomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Check if room exists
    await this.findOneRoom(createBookingDto.room_id);

    // Convert string dates to Date objects
    const startTime = new Date(createBookingDto.start_time);
    const endTime = new Date(createBookingDto.end_time);

    // Check for booking conflicts
    const conflicts = await this.bookingRepository.find({
      where: {
        room_id: createBookingDto.room_id,
        start_time: LessThanOrEqual(endTime),
        end_time: MoreThanOrEqual(startTime),
      },
    });

    if (conflicts.length > 0) {
      throw new BadRequestException('Room is already booked for this time slot');
    }

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      start_time: startTime,
      end_time: endTime
    });
    return await this.bookingRepository.save(booking);
  }

  async findAllBookings(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: ['room'],
    });
  }

  async findOneBooking(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['room'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOneBooking(id);
    
    // If updating time slots, check for conflicts
    if (updateBookingDto.start_time || updateBookingDto.end_time) {
      const startTime = updateBookingDto.start_time ? new Date(updateBookingDto.start_time) : booking.start_time;
      const endTime = updateBookingDto.end_time ? new Date(updateBookingDto.end_time) : booking.end_time;
      
      const conflicts = await this.bookingRepository.find({
        where: {
          id: Not(id),
          room_id: booking.room_id,
          start_time: LessThanOrEqual(endTime),
          end_time: MoreThanOrEqual(startTime),
        },
      });

      if (conflicts.length > 0) {
        throw new BadRequestException('Room is already booked for this time slot');
      }

      // Update the DTO with the Date objects
      if (updateBookingDto.start_time) {
        updateBookingDto = {
          ...updateBookingDto,
          start_time: startTime.toISOString()
        };
      }
      if (updateBookingDto.end_time) {
        updateBookingDto = {
          ...updateBookingDto,
          end_time: endTime.toISOString()
        };
      }
    }

    Object.assign(booking, updateBookingDto);
    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: string): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }

  async findAvailableRooms(start_time: Date, end_time: Date, capacity?: number): Promise<Room[]> {
    // Get all rooms that match capacity requirement
    let rooms = await this.roomRepository.find({
      where: capacity ? { capacity: MoreThanOrEqual(capacity) } : {},
    });

    // Get all bookings that overlap with the requested time slot
    const bookings = await this.bookingRepository.find({
      where: {
        start_time: LessThanOrEqual(end_time),
        end_time: MoreThanOrEqual(start_time),
      },
    });

    // Filter out rooms that have conflicting bookings
    const bookedRoomIds = new Set(bookings.map(booking => booking.room_id));
    rooms = rooms.filter(room => !bookedRoomIds.has(room.id));

    return rooms;
  }
} 