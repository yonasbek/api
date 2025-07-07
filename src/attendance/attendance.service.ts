import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Check for existing attendance record for the day
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        user_id: createAttendanceDto.user_id,
        date: Between(
          new Date(new Date(createAttendanceDto?.check_in?.timestamp || new Date().toISOString()).setHours(0,0,0,0)),
          new Date(new Date(createAttendanceDto?.check_in?.timestamp || new Date().toISOString()).setHours(23,59,59,999))
        ),
      },
    });

    if (existingAttendance) {
      throw new Error('Attendance record already exists for this day');
    }

    const attendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      date: new Date(createAttendanceDto?.check_in?.timestamp || new Date().toISOString()),
      work_hours: 0,
      is_late: false,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async findAll(filters: {
    user_id?: string;
    start_date?: Date;
    end_date?: Date;
    status?: AttendanceStatus;
  } = {}): Promise<Attendance[]> {
    const where: any = {};

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.start_date && filters.end_date) {
      where.date = Between(filters.start_date, filters.end_date);
    }

    return await this.attendanceRepository.find({
      where,
      order: {
        date: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    
    Object.assign(attendance, updateAttendanceDto);

    // Calculate work hours if both check-in and check-out exist
    if (attendance.check_in && attendance.check_out && attendance.check_out.timestamp) {
      // Ensure timestamps are Date objects before calculation
      const checkInTime = new Date(attendance.check_in.timestamp);
      const checkOutTime = new Date(attendance.check_out.timestamp);
      
      const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      attendance.work_hours = Number(hours.toFixed(2));
    }

    // Update late status based on check-in time
    if (attendance.check_in) {
      const checkInHour = new Date(attendance.check_in.timestamp).getHours();
      const checkInMinutes = new Date(attendance.check_in.timestamp).getMinutes();
      attendance.is_late = checkInHour > 9 || (checkInHour === 9 && checkInMinutes > 0);
    }

    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const result = await this.attendanceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async findByUser(userId: string): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      where: { user_id: userId },
      order: {
        date: 'DESC',
      },
    });
  }

  async getStatistics(startDate: Date, endDate: Date) {
    const attendances = await this.findByDateRange(startDate, endDate);
    
    const statistics = {
      totalAttendances: attendances.length,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      halfDayCount: 0,
      averageWorkingHours: 0,
    };

    let totalWorkingHours = 0;
    let recordsWithWorkingHours = 0;

    attendances.forEach(attendance => {
      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          statistics.presentCount++;
          break;
        case AttendanceStatus.ABSENT:
          statistics.absentCount++;
          break;
        case AttendanceStatus.LATE:
          statistics.lateCount++;
          break;
        case AttendanceStatus.LEAVE:
          statistics.halfDayCount++;
          break;
      }

      if (attendance.check_in && attendance.check_out) {
        const hours = (attendance.check_out.timestamp.getTime() - attendance.check_in.timestamp.getTime()) / (1000 * 60 * 60);
        totalWorkingHours += hours;
        recordsWithWorkingHours++;
      }
    });

    if (recordsWithWorkingHours > 0) {
      statistics.averageWorkingHours = Number((totalWorkingHours / recordsWithWorkingHours).toFixed(2));
    }

    return statistics;
  }

  async checkOut(id: string, checkOutData: any): Promise<Attendance> {
    const attendance = await this.findOne(id);
    if (attendance.check_out) {
      throw new BadRequestException('Check-out already recorded');
    }
    attendance.check_out = checkOutData;
    return await this.attendanceRepository.save(attendance);
  }

  async getStats(user_id?: string, start_date?: Date, end_date?: Date) {
    const where: any = {};
    
    if (user_id) {
      where.user_id = user_id;
    }
    
    if (start_date && end_date) {
      where.date = Between(start_date, end_date);
    }

    const attendances = await this.attendanceRepository.find({ where });
    return this.getStatistics(start_date || new Date(0), end_date || new Date());
  }

  async getMonthlyReport(year: number, month: number, userId?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const where: any = {
      date: Between(startDate, endDate)
    };

    if (userId) {
      where.user_id = userId;
    }

    const attendances = await this.attendanceRepository.find({ where });
    
    return {
      totalDays: endDate.getDate(),
      workingDays: attendances.length,
      present: attendances.filter(a => a.status === AttendanceStatus.PRESENT).length,
      absent: attendances.filter(a => a.status === AttendanceStatus.ABSENT).length,
      late: attendances.filter(a => a.status === AttendanceStatus.LATE).length,
      leave: attendances.filter(a => a.status === AttendanceStatus.LEAVE).length,
      totalWorkHours: attendances.reduce((sum, a) => sum + (a.work_hours || 0), 0),
    };
  }

  async approveLeave(id: string): Promise<Attendance> {
    const attendance = await this.findOne(id);
    if (attendance.status !== AttendanceStatus.LEAVE) {
      throw new BadRequestException('This record is not a leave request');
    }
    attendance.status = AttendanceStatus.LEAVE;
    return await this.attendanceRepository.save(attendance);
  }

  async rejectLeave(id: string, reason: string): Promise<Attendance> {
    const attendance = await this.findOne(id);
    if (attendance.status !== AttendanceStatus.LEAVE) {
      throw new BadRequestException('This record is not a leave request');
    }
    attendance.status = AttendanceStatus.ABSENT;
    attendance.leave_reason = reason;
    return await this.attendanceRepository.save(attendance);
  }

  async bulkUpdate(ids: string[], updateDto: UpdateAttendanceDto): Promise<Attendance[]> {
    const attendances = await this.attendanceRepository.findByIds(ids);
    if (attendances.length !== ids.length) {
      throw new NotFoundException('Some attendance records were not found');
    }

    const updatedAttendances = attendances.map(attendance => {
      return Object.assign(attendance, updateDto);
    });

    return await this.attendanceRepository.save(updatedAttendances);
  }
} 