import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EnrollmentsService } from '../services/enrollments.service';
import { EnrollTraineeDto } from '../dto/enroll-trainee.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import {
  CourseEnrollment,
  EnrollmentStatus,
} from '../entities/course-enrollment.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll a trainee in a course' })
  @ApiResponse({
    status: 201,
    description: 'Trainee enrolled successfully',
    type: CourseEnrollment,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Course or trainee not found' })
  async enrollTrainee(
    @Body() enrollTraineeDto: EnrollTraineeDto,
  ): Promise<CourseEnrollment> {
    return await this.enrollmentsService.enrollTrainee(enrollTraineeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiResponse({
    status: 200,
    description: 'Return all enrollments',
    type: [CourseEnrollment],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EnrollmentStatus,
    description: 'Filter by enrollment status',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter by course ID',
  })
  @ApiQuery({
    name: 'traineeId',
    required: false,
    description: 'Filter by trainee ID',
  })
  async findAll(
    @Query('status') status?: EnrollmentStatus,
    @Query('courseId') courseId?: string,
    @Query('traineeId') traineeId?: string,
  ): Promise<CourseEnrollment[]> {
    if (courseId) {
      return await this.enrollmentsService.findByCourse(courseId);
    }
    if (traineeId) {
      return await this.enrollmentsService.findByTrainee(traineeId);
    }
    if (status) {
      return await this.enrollmentsService.findByStatus(status);
    }
    return await this.enrollmentsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get enrollment statistics' })
  @ApiResponse({ status: 200, description: 'Return enrollment statistics' })
  async getStats() {
    return await this.enrollmentsService.getEnrollmentStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enrollment by id' })
  @ApiResponse({
    status: 200,
    description: 'Return an enrollment',
    type: CourseEnrollment,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async findOne(@Param('id') id: string): Promise<CourseEnrollment> {
    return await this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an enrollment' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment updated successfully',
    type: CourseEnrollment,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<CourseEnrollment> {
    return await this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete completed enrollment',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.enrollmentsService.remove(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm an enrollment' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment confirmed successfully',
    type: CourseEnrollment,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({
    status: 400,
    description: 'Only pending enrollments can be confirmed',
  })
  async confirmEnrollment(@Param('id') id: string): Promise<CourseEnrollment> {
    return await this.enrollmentsService.confirmEnrollment(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an enrollment' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment cancelled successfully',
    type: CourseEnrollment,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel completed enrollment',
  })
  async cancelEnrollment(@Param('id') id: string): Promise<CourseEnrollment> {
    return await this.enrollmentsService.cancelEnrollment(id);
  }
}
