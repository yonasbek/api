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
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubActivitiesService } from './subactivities.service';
import { CreateSubActivityDto } from './dto/create-subactivity.dto';
import { UpdateSubActivityDto } from './dto/update-subactivity.dto';
import { UpdateSubActivityProgressDto } from './dto/update-subactivity-progress.dto';
import { SubActivity } from './entities/subactivity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('SubActivities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subactivities')
export class SubActivitiesController {
  constructor(private readonly subActivitiesService: SubActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subactivity' })
  @ApiResponse({ status: 201, description: 'SubActivity created successfully', type: SubActivity })
  async create(@Body() createSubActivityDto: CreateSubActivityDto): Promise<SubActivity> {
    return await this.subActivitiesService.create(createSubActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subactivities' })
  @ApiResponse({ status: 200, description: 'Return all subactivities', type: [SubActivity] })
  async findAll(
    @Query('activity_id') activityId?: string,
    @Query('user_id') userId?: string,
    @Query('user_email') userEmail?: string,
  ): Promise<SubActivity[]> {
    if (activityId) {
      return await this.subActivitiesService.findByActivityId(activityId);
    }
    if (userId) {
      return await this.subActivitiesService.findByUserId(userId);
    }
    if (userEmail) {
      return await this.subActivitiesService.findByUserEmail(userEmail);
    }
    return await this.subActivitiesService.findAll();
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get subactivities assigned to current user' })
  @ApiResponse({ status: 200, description: 'Return user\'s subactivities', type: [SubActivity] })
  async getMyTasks(@Request() req): Promise<SubActivity[]> {
    const userId = req.user.id;
    return await this.subActivitiesService.findByUserId(userId);
  }

  @Get('activity/:activityId/stats')
  @ApiOperation({ summary: 'Get subactivity statistics for an activity' })
  @ApiResponse({ status: 200, description: 'Return subactivity statistics' })
  async getSubActivityStats(@Param('activityId') activityId: string) {
    return await this.subActivitiesService.getSubActivityStats(activityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subactivity by id' })
  @ApiResponse({ status: 200, description: 'Return a subactivity', type: SubActivity })
  @ApiResponse({ status: 404, description: 'SubActivity not found' })
  async findOne(@Param('id') id: string): Promise<SubActivity> {
    return await this.subActivitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subactivity' })
  @ApiResponse({ status: 200, description: 'SubActivity updated successfully', type: SubActivity })
  @ApiResponse({ status: 404, description: 'SubActivity not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSubActivityDto: UpdateSubActivityDto
  ): Promise<SubActivity> {
    return await this.subActivitiesService.update(id, updateSubActivityDto);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update subactivity progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully', type: SubActivity })
  @ApiResponse({ status: 404, description: 'SubActivity not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this subactivity' })
  async updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateSubActivityProgressDto,
    @Request() req
  ): Promise<SubActivity> {
    const userId = req.user.id;
    return await this.subActivitiesService.updateProgress(id, updateProgressDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subactivity' })
  @ApiResponse({ status: 200, description: 'SubActivity deleted successfully' })
  @ApiResponse({ status: 404, description: 'SubActivity not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.subActivitiesService.remove(id);
  }
} 