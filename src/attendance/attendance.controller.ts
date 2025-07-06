import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, CheckInOutDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AttendanceStatus } from './entities/attendance.entity';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check in for the day' })
  @ApiResponse({ status: 201, description: 'Check-in recorded successfully' })
  async checkIn(
    @Body() checkInData: CreateAttendanceDto
  ) {
    return await this.attendanceService.create({
      ...checkInData,
      status: AttendanceStatus.PRESENT
    });
  }

  @Post(':id/check-out')
  @ApiOperation({ summary: 'Check out for the day' })
  @ApiResponse({ status: 200, description: 'Check-out recorded successfully' })
  async checkOut(
    @Param('id') id: string,
    @Body() checkOutData: CheckInOutDto
  ) {
    return await this.attendanceService.update(id, { check_out: checkOutData });
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'Return all attendance records' })
  async findAll(
    @Query('user_id') user_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
    @Query('status') status?: AttendanceStatus
  ) {
    return await this.attendanceService.findAll({
      user_id,
      start_date,
      end_date,
      status
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiResponse({ status: 200, description: 'Return attendance statistics' })
  async getStats(
    @Query('user_id') user_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date
  ) {
    return await this.attendanceService.getStats(user_id, start_date, end_date);
  }

  @Get('monthly-report')
  @ApiOperation({ summary: 'Get monthly attendance report' })
  @ApiResponse({ status: 200, description: 'Return monthly attendance report' })
  async getMonthlyReport(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('userId') userId?: string
  ) {
    return await this.attendanceService.getMonthlyReport(year, month, userId);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Request leave' })
  @ApiResponse({ status: 201, description: 'Leave request submitted successfully' })
  async requestLeave(
    @Body() leaveData: CreateAttendanceDto
  ) {
    return await this.attendanceService.create({
      ...leaveData,
      status: AttendanceStatus.LEAVE
    });
  }

  @Post(':id/approve-leave')
  @ApiOperation({ summary: 'Approve leave request' })
  @ApiResponse({ status: 200, description: 'Leave request approved successfully' })
  async approveLeave(@Param('id') id: string) {
    return await this.attendanceService.approveLeave(id);
  }

  @Post(':id/reject-leave')
  @ApiOperation({ summary: 'Reject leave request' })
  @ApiResponse({ status: 200, description: 'Leave request rejected successfully' })
  async rejectLeave(
    @Param('id') id: string,
    @Body('reason') reason: string
  ) {
    return await this.attendanceService.rejectLeave(id, reason);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update attendance records' })
  @ApiResponse({ status: 200, description: 'Attendance records updated successfully' })
  async bulkUpdate(
    @Body('ids') ids: string[],
    @Body('update') update: UpdateAttendanceDto
  ) {
    return await this.attendanceService.bulkUpdate(ids, update);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiResponse({ status: 200, description: 'Return attendance record' })
  async findOne(@Param('id') id: string) {
    return await this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto
  ) {
    return await this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record deleted successfully' })
  async remove(@Param('id') id: string) {
    return await this.attendanceService.remove(id);
  }
} 