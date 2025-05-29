import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { GanttChartItemDto } from './dto/gantt-chart.dto';
import { Activity, ActivityStatus } from './entities/activity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({ status: 201, description: 'Activity created successfully', type: Activity })
  async create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return await this.activitiesService.create(createActivityDto);
  }

  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload supporting documents for an activity' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Documents uploaded successfully', type: Activity })
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<Activity> {
    return await this.activitiesService.uploadSupportingDocuments(id, files);
  }

  @Delete(':id/documents/:filename')
  @ApiOperation({ summary: 'Remove a supporting document from an activity' })
  @ApiResponse({ status: 200, description: 'Document removed successfully', type: Activity })
  async removeDocument(
    @Param('id') id: string,
    @Param('filename') filename: string
  ): Promise<Activity> {
    return await this.activitiesService.removeSupportingDocument(id, filename);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  @ApiResponse({ status: 200, description: 'Return all activities', type: [Activity] })
  async findAll(
    @Query('plan_id') planId?: string,
    @Query('status') status?: ActivityStatus,
  ): Promise<Activity[]> {
    if (planId) {
      return await this.activitiesService.findByPlanId(planId);
    }
    if (status) {
      return await this.activitiesService.findByStatus(status);
    }
    return await this.activitiesService.findAll();
  }

  @Get('gantt')
  @ApiOperation({ summary: 'Get Gantt chart data' })
  @ApiResponse({ status: 200, description: 'Return Gantt chart data', type: [GanttChartItemDto] })
  async getGanttChartData(): Promise<GanttChartItemDto[]> {
    return await this.activitiesService.getGanttChartData();
  }

  @Get('budget/:planId')
  @ApiOperation({ summary: 'Get budget summary for a plan' })
  @ApiResponse({ status: 200, description: 'Return budget summary' })
  async getBudgetSummary(@Param('planId') planId: string): Promise<{
    total_allocated: number;
    total_spent: number;
    remaining: number;
  }> {
    return await this.activitiesService.getBudgetSummary(planId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an activity by id' })
  @ApiResponse({ status: 200, description: 'Return an activity', type: Activity })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(@Param('id') id: string): Promise<Activity> {
    return await this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully', type: Activity })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    return await this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.activitiesService.remove(id);
  }
} 