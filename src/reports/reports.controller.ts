import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-metrics')
  @ApiOperation({ summary: 'Get dashboard metrics for top section' })
  @ApiResponse({ status: 200, description: 'Return dashboard metrics' })
  async getDashboardMetrics() {
    return this.reportsService.getDashboardMetrics();
  }

  @Get('memo-summary')
  @ApiOperation({ summary: 'Get memo summary section' })
  @ApiResponse({ status: 200, description: 'Return memo summary data' })
  async getMemoSummary() {
    return this.reportsService.getMemoSummary();
  }

  @Get('meeting-room-bookings')
  @ApiOperation({ summary: 'Get meeting room booking overview' })
  @ApiResponse({ status: 200, description: 'Return meeting room booking data' })
  async getMeetingRoomBookings() {
    return this.reportsService.getMeetingRoomBookings();
  }

  @Get('document-library-insights')
  @ApiOperation({ summary: 'Get document library insights' })
  @ApiResponse({ status: 200, description: 'Return document library data' })
  async getDocumentLibraryInsights() {
    return this.reportsService.getDocumentLibraryInsights();
  }

  @Get('task-tracking-snapshot')
  @ApiOperation({ summary: 'Get task tracking snapshot' })
  @ApiResponse({ status: 200, description: 'Return task tracking data' })
  async getTaskTrackingSnapshot() {
    return this.reportsService.getTaskTrackingSnapshot();
  }

  @Get('attendance-analytics')
  @ApiOperation({ summary: 'Get attendance analytics data' })
  @ApiResponse({ status: 200, description: 'Return attendance analytics' })
  async getAttendanceAnalytics() {
    return this.reportsService.getAttendanceAnalytics();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all report data at once' })
  @ApiResponse({ status: 200, description: 'Return all report sections' })
  async getAllReports() {
    const [
      dashboardMetrics,
      memoSummary,
      meetingRoomBookings,
      documentLibraryInsights,
      taskTrackingSnapshot,
      attendanceAnalytics,
    ] = await Promise.all([
      this.reportsService.getDashboardMetrics(),
      this.reportsService.getMemoSummary(),
      this.reportsService.getMeetingRoomBookings(),
      this.reportsService.getDocumentLibraryInsights(),
      this.reportsService.getTaskTrackingSnapshot(),
      this.reportsService.getAttendanceAnalytics(),
    ]);

    return {
      dashboardMetrics,
      memoSummary,
      meetingRoomBookings,
      documentLibraryInsights,
      taskTrackingSnapshot,
      attendanceAnalytics,
    };
  }
} 