import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Meeting Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // Room endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Return all rooms' })
  findAll() {
    return this.roomsService.findAllRooms();
  }

  @Get('available')
  @ApiOperation({ summary: 'Find available rooms for a time slot' })
  @ApiResponse({ status: 200, description: 'Return available rooms' })
  findAvailable(
    @Query('start_time') startTime: Date,
    @Query('end_time') endTime: Date,
    @Query('capacity') capacity?: number,
  ) {
    return this.roomsService.findAvailableRooms(startTime, endTime, capacity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by id' })
  @ApiResponse({ status: 200, description: 'Return a room' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOneRoom(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.updateRoom(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  remove(@Param('id') id: string) {
    return this.roomsService.deleteRoom(id);
  }

  // Booking endpoints
  @Post('bookings')
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.roomsService.createBooking(createBookingDto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'Return all bookings' })
  findAllBookings() {
    return this.roomsService.findAllBookings();
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiResponse({ status: 200, description: 'Return a booking' })
  findOneBooking(@Param('id') id: string) {
    return this.roomsService.findOneBooking(id);
  }

  @Patch('bookings/:id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  updateBooking(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.roomsService.updateBooking(id, updateBookingDto);
  }

  @Delete('bookings/:id')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  removeBooking(@Param('id') id: string) {
    return this.roomsService.deleteBooking(id);
  }

  @Get('bookings/room/:id')
  @ApiOperation({ summary: 'Get bookings by room id' })
  @ApiResponse({ status: 200, description: 'Return bookings by room id' })
  getBookingsByRoomId(@Param('id') id: string) {
    return this.roomsService.getBookingsByRoomId(id);
  }
} 