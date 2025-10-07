import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { AssignTrainerDto } from '../dto/assign-trainer.dto';
import { Course } from '../entities/course.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully', type: Course })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Return all courses', type: [Course] })
  @ApiQuery({ name: 'search', required: false, description: 'Search courses by title or description' })
  async findAll(
    @Query('search') search?: string,
  ): Promise<Course[]> {
    if (search) {
      return await this.coursesService.searchCourses(search);
    }
    return await this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by id' })
  @ApiResponse({ status: 200, description: 'Return a course', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string): Promise<Course> {
    return await this.coursesService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get course statistics' })
  @ApiResponse({ status: 200, description: 'Return course statistics' })
  async getStats(@Param('id') id: string) {
    return await this.coursesService.getCourseStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return await this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete course with enrollments' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.coursesService.remove(id);
  }

  @Post(':id/assign-trainers')
  @ApiOperation({ summary: 'Assign trainers to a course' })
  @ApiResponse({ status: 200, description: 'Trainers assigned successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async assignTrainers(
    @Param('id') id: string,
    @Body() assignTrainerDto: AssignTrainerDto,
  ): Promise<Course> {
    assignTrainerDto.course_id = id;
    return await this.coursesService.assignTrainers(assignTrainerDto);
  }

  @Delete(':courseId/trainers/:trainerId')
  @ApiOperation({ summary: 'Remove a trainer from a course' })
  @ApiResponse({ status: 200, description: 'Trainer removed successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course or trainer not found' })
  async removeTrainer(
    @Param('courseId') courseId: string,
    @Param('trainerId') trainerId: string,
  ): Promise<Course> {
    return await this.coursesService.removeTrainer(courseId, trainerId);
  }
}

