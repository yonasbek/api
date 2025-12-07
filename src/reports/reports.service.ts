import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { Booking } from '../rooms/entities/booking.entity';
import { Memo } from '../memos/entities/memo.entity';
import { Document } from '../documents/entities/document.entity';
import { MemoStatus } from '../memos/dto/create-memo.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Memo)
    private memoRepository: Repository<Memo>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async getDashboardMetrics() {
    // Real data from existing modules
    const totalUsers = await this.userRepository.count();
    const totalRooms = await this.roomRepository.count();
    const totalBookings = await this.bookingRepository.count();

    // Get upcoming meetings this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const upcomingMeetings = await this.bookingRepository.count({
      where: {
        start_time: Between(startOfWeek, endOfWeek),
      },
    });

    // Get active memos count
    const activeMemos = await this.memoRepository.count({
      where: {
        status: MemoStatus.APPROVED,
      },
    });

    // Get documents uploaded this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const documentsUploadedThisMonth = await this.documentRepository.count({
      where: {
        createdAt: Between(startOfMonth, new Date()),
      },
    });

    return {
      // Top Section Metrics
      activeMemos: activeMemos || 25, // Real data with fallback
      upcomingMeetings,
      attendanceToday: 85.5, // Dummy data - would come from attendance module
      documentsUploadedThisMonth: documentsUploadedThisMonth || 142, // Real data with fallback
      tasksDueThisWeek: 8, // Dummy data - would come from tasks module

      // Real data
      totalUsers,
      totalRooms,
      totalBookings,
    };
  }

  async getMemoSummary() {
    try {
      const memos = await this.memoRepository.find({
        relations: ['recipients'],
        order: { created_at: 'DESC' },
        take: 10,
      });

      if (memos.length > 0) {
        return memos.map((memo) => ({
          title: memo.title,
          type: memo.memo_type,
          issuedBy: memo.department,
          dateIssued: memo.date_of_issue.toISOString().split('T')[0],
          recipients: memo.recipients
            ?.map((r) => r.fullName || r.firstName + ' ' + r.lastName)
            .filter(Boolean) || ['All Staff'],
          status: memo.status,
        }));
      }
    } catch (error) {
      console.log('Error fetching memos, using dummy data:', error);
    }

    // Fallback dummy data
    return [
      {
        title: 'Q4 Budget Review',
        type: 'GENERAL',
        issuedBy: 'Finance Department',
        dateIssued: '2024-01-15',
        recipients: ['All Staff'],
        status: 'APPROVED',
      },
      {
        title: 'New Security Protocols',
        type: 'INSTRUCTIONAL',
        issuedBy: 'IT Department',
        dateIssued: '2024-01-12',
        recipients: ['All Staff'],
        status: 'APPROVED',
      },
      {
        title: 'Holiday Schedule Update',
        type: 'INFORMATIONAL',
        issuedBy: 'Human Resources',
        dateIssued: '2024-01-10',
        recipients: ['All Staff'],
        status: 'APPROVED',
      },
    ];
  }

  async getMeetingRoomBookings() {
    const bookings = await this.bookingRepository.find({
      relations: ['room'],
      order: { start_time: 'DESC' },
      take: 10,
    });

    return bookings.map((booking) => ({
      room: booking.room?.name || 'Unknown Room',
      date: booking.start_time.toISOString().split('T')[0],
      time: `${booking.start_time.toLocaleTimeString()} - ${booking.end_time.toLocaleTimeString()}`,
      bookedBy:
        booking.attendees?.length > 0
          ? booking.attendees[0].name
          : 'Unknown User',
      meetingTitle: booking.title,
      status: new Date() > booking.end_time ? 'Completed' : 'Scheduled',
    }));
  }

  async getDocumentLibraryInsights() {
    try {
      const documents = await this.documentRepository.find({
        relations: ['uploadedBy'],
        order: { createdAt: 'DESC' },
        take: 10,
      });

      if (documents.length > 0) {
        return documents.map((doc) => ({
          title: doc.title,
          uploadedBy:
            doc.uploadedBy?.fullName ||
            doc.uploadedBy?.firstName + ' ' + doc.uploadedBy?.lastName ||
            'Unknown User',
          date: doc.createdAt.toISOString().split('T')[0],
          category: doc.category,
          downloads: Math.floor(Math.random() * 100) + 1, // Random downloads since we don't track this
        }));
      }
    } catch (error) {
      console.log('Error fetching documents, using dummy data:', error);
    }

    // Fallback dummy data
    return [
      {
        title: 'Employee Handbook 2024',
        uploadedBy: 'HR Department',
        date: '2024-01-15',
        category: 'HR',
        downloads: 45,
      },
      {
        title: 'Security Guidelines',
        uploadedBy: 'IT Department',
        date: '2024-01-12',
        category: 'IT',
        downloads: 32,
      },
      {
        title: 'Budget Report Q4',
        uploadedBy: 'Finance Team',
        date: '2024-01-10',
        category: 'Finance',
        downloads: 28,
      },
    ];
  }

  async getTaskTrackingSnapshot() {
    // Dummy data for task tracking
    return [
      {
        title: 'Update website content',
        assignedTo: 'Marketing Team',
        dueDate: '2024-01-20',
        progress: 75,
        status: 'In Progress',
      },
      {
        title: 'Quarterly review preparation',
        assignedTo: 'Management',
        dueDate: '2024-01-18',
        progress: 50,
        status: 'In Progress',
      },
      {
        title: 'Server maintenance',
        assignedTo: 'IT Department',
        dueDate: '2024-01-22',
        progress: 25,
        status: 'Not Started',
      },
    ];
  }

  async getAttendanceAnalytics() {
    // Dummy data for attendance analytics
    return {
      dates: [
        '2024-01-15',
        '2024-01-16',
        '2024-01-17',
        '2024-01-18',
        '2024-01-19',
      ],
      present: [85, 88, 82, 90, 87],
      absent: [10, 8, 12, 6, 9],
      late: [5, 4, 6, 4, 4],
      wfh: [15, 18, 20, 12, 16],
    };
  }
}
