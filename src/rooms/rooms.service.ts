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
    const rooms = await this.roomRepository.find();
    // Update room status based on current bookings
    const now = new Date();
    for (const room of rooms) {
      const currentBookings = await this.bookingRepository.find({
        where: {
          room_id: room.id,
          start_time: LessThanOrEqual(now),
          end_time: MoreThanOrEqual(now),
        },
      });
      
      // Check for recurring bookings that are currently active
      const recurringBookings = await this.bookingRepository.find({
        where: {
          room_id: room.id,
          is_recurring: true,
        },
      });
      
      // Check if any recurring booking is active now
      for (const booking of recurringBookings) {
        if (this.isRecurringBookingActive(booking, now)) {
          currentBookings.push(booking);
          break;
        }
      }
      
      if (currentBookings.length > 0 && room.status === RoomStatus.AVAILABLE) {
        room.status = RoomStatus.OCCUPIED;
        await this.roomRepository.save(room);
      } else if (currentBookings.length === 0 && room.status === RoomStatus.OCCUPIED) {
        // Only change back to available if it's not in maintenance
          room.status = RoomStatus.AVAILABLE;
          await this.roomRepository.save(room);
      }
    }
    return rooms;
  }

  private isRecurringBookingActive(booking: Booking, checkTime: Date): boolean {
    if (!booking.is_recurring || !booking.recurring_pattern) {
      return false;
    }

    const pattern = booking.recurring_pattern;
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    const endDate = new Date(pattern.endDate || pattern.endDate);

    // Check if checkTime is before the recurring end date
    if (checkTime > endDate) {
      return false;
    }

    // Check if checkTime is after the first occurrence start
    if (checkTime < startTime) {
      return false;
    }

    const { frequency, interval } = pattern;
    const duration = endTime.getTime() - startTime.getTime();

    // Calculate which occurrence we're in
    let occurrenceStart = new Date(startTime);
    let occurrenceEnd = new Date(endTime);

    while (occurrenceStart <= endDate && occurrenceStart <= checkTime) {
      if (checkTime >= occurrenceStart && checkTime <= occurrenceEnd) {
        return true;
      }

      // Move to next occurrence
      switch (frequency) {
        case 'daily':
          occurrenceStart.setDate(occurrenceStart.getDate() + interval);
          break;
        case 'weekly':
          occurrenceStart.setDate(occurrenceStart.getDate() + (7 * interval));
          break;
        case 'monthly':
          occurrenceStart.setMonth(occurrenceStart.getMonth() + interval);
          break;
      }
      occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
    }

    return false;
  }

  async findOneRoom(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    
    // Check if room is currently occupied
    const now = new Date();
    const currentBookings = await this.bookingRepository.find({
      where: {
        room_id: id,
        start_time: LessThanOrEqual(now),
        end_time: MoreThanOrEqual(now),
      },
    });
    
    // Check for recurring bookings that are currently active
    const recurringBookings = await this.bookingRepository.find({
      where: {
        room_id: id,
        is_recurring: true,
      },
    });
    
    for (const booking of recurringBookings) {
      if (this.isRecurringBookingActive(booking, now)) {
        currentBookings.push(booking);
        break;
      }
    }
    
    if (currentBookings.length > 0 && room.status === RoomStatus.AVAILABLE) {
      room.status = RoomStatus.OCCUPIED;
      await this.roomRepository.save(room);
    } else if (currentBookings.length === 0 && room.status === RoomStatus.OCCUPIED) {
        room.status = RoomStatus.AVAILABLE;
        await this.roomRepository.save(room);
      
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

    // Validate that end time is after start time
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for booking conflicts (including recurring bookings)
    const conflicts = await this.checkBookingConflicts(
      createBookingDto.room_id,
      startTime,
      endTime,
      createBookingDto.is_recurring,
      createBookingDto.recurring_pattern
    );

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c => {
        if (c.is_recurring) {
          return `recurring booking "${c.title}"`;
        }
        return `booking "${c.title}" from ${c.start_time.toLocaleString()} to ${c.end_time.toLocaleString()}`;
      }).join(', ');
      throw new BadRequestException(`Room is already booked for this time slot. Conflicting with: ${conflictDetails}`);
    }

    // Map recurring_pattern end_date to endDate for entity
    const bookingData: any = {
      ...createBookingDto,
      start_time: startTime,
      end_time: endTime
    };
    
    if (bookingData.recurring_pattern && bookingData.recurring_pattern.end_date) {
      bookingData.recurring_pattern = {
        ...bookingData.recurring_pattern,
        endDate: bookingData.recurring_pattern.end_date
      };
      delete bookingData.recurring_pattern.end_date;
    }
    
    const booking = this.bookingRepository.create(bookingData);
    return await this.bookingRepository.save(booking as unknown as Booking);
  }

  private async checkBookingConflicts(
    roomId: string,
    startTime: Date,
    endTime: Date,
    isRecurring?: boolean,
    recurringPattern?: { frequency: 'daily' | 'weekly' | 'monthly'; interval: number; end_date: string }
  ): Promise<Booking[]> {
    const conflicts: Booking[] = [];

    // Get all existing bookings for this room
    const allBookings = await this.bookingRepository.find({
      where: { room_id: roomId },
    });

    for (const existingBooking of allBookings) {
      // Check non-recurring bookings
      if (!existingBooking.is_recurring) {
        if (this.hasTimeOverlap(
          startTime,
          endTime,
          new Date(existingBooking.start_time),
          new Date(existingBooking.end_time)
        )) {
          conflicts.push(existingBooking);
        }
      } else {
        // Check recurring bookings
        if (this.hasRecurringConflict(
          startTime,
          endTime,
          existingBooking,
          isRecurring,
          recurringPattern
        )) {
          conflicts.push(existingBooking);
        }
      }
    }

    // If this is a recurring booking, check against all future occurrences
    if (isRecurring && recurringPattern) {
      const endDate = new Date(recurringPattern.end_date);
      let occurrenceStart = new Date(startTime);
      let occurrenceEnd = new Date(endTime);
      const duration = endTime.getTime() - startTime.getTime();

      while (occurrenceStart <= endDate) {
        for (const existingBooking of allBookings) {
          if (!existingBooking.is_recurring) {
            if (this.hasTimeOverlap(
              occurrenceStart,
              occurrenceEnd,
              new Date(existingBooking.start_time),
              new Date(existingBooking.end_time)
            )) {
              conflicts.push(existingBooking);
            }
          } else {
            // Check recurring vs recurring
            if (this.hasRecurringConflict(
              occurrenceStart,
              occurrenceEnd,
              existingBooking,
              true,
              recurringPattern
            )) {
              conflicts.push(existingBooking);
            }
          }
        }

        // Move to next occurrence
        switch (recurringPattern.frequency) {
          case 'daily':
            occurrenceStart.setDate(occurrenceStart.getDate() + recurringPattern.interval);
            break;
          case 'weekly':
            occurrenceStart.setDate(occurrenceStart.getDate() + (7 * recurringPattern.interval));
            break;
          case 'monthly':
            occurrenceStart.setMonth(occurrenceStart.getMonth() + recurringPattern.interval);
            break;
        }
        occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
      }
    }

    return conflicts;
  }

  private hasTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  private hasRecurringConflict(
    newStart: Date,
    newEnd: Date,
    existingBooking: Booking,
    isNewRecurring?: boolean,
    newPattern?: { frequency: 'daily' | 'weekly' | 'monthly'; interval: number; end_date: string }
  ): boolean {
    if (!existingBooking.is_recurring || !existingBooking.recurring_pattern) {
      return false;
    }

    const pattern = existingBooking.recurring_pattern;
    const existingStart = new Date(existingBooking.start_time);
    const existingEnd = new Date(existingBooking.end_time);
    const existingEndDate = new Date(pattern.endDate || pattern.endDate);
    const duration = existingEnd.getTime() - existingStart.getTime();

    // Check if the new booking time overlaps with any occurrence of the existing recurring booking
    let occurrenceStart = new Date(existingStart);
    let occurrenceEnd = new Date(existingEnd);

    while (occurrenceStart <= existingEndDate) {
      if (this.hasTimeOverlap(newStart, newEnd, occurrenceStart, occurrenceEnd)) {
        return true;
      }

      // Move to next occurrence
      switch (pattern.frequency) {
        case 'daily':
          occurrenceStart.setDate(occurrenceStart.getDate() + pattern.interval);
          break;
        case 'weekly':
          occurrenceStart.setDate(occurrenceStart.getDate() + (7 * pattern.interval));
          break;
        case 'monthly':
          occurrenceStart.setMonth(occurrenceStart.getMonth() + pattern.interval);
          break;
      }
      occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
    }

    return false;
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

  async getBookingsByRoomId(roomId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { room_id: roomId },
    });
  }
} 