import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdHocTasksService } from './adhoc-tasks.service';
import { CreateAdHocTaskDto } from './dto/create-adhoc-task.dto';
import { UpdateAdHocTaskDto } from './dto/update-adhoc-task.dto';
import { AdHocTask } from './entities/adhoc-task.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Ad-Hoc Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/plans/:planId/adhoc-tasks')
export class AdHocTasksController {
  constructor(private readonly adHocTasksService: AdHocTasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create an Ad-Hoc Task linked to a plan' })
  @ApiResponse({
    status: 201,
    description: 'Ad-Hoc Task created successfully',
    type: AdHocTask,
  })
  async create(
    @Param('planId') planId: string,
    @Body() dto: CreateAdHocTaskDto,
  ): Promise<AdHocTask> {
    return await this.adHocTasksService.create(planId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Ad-Hoc Tasks for a plan' })
  @ApiResponse({
    status: 200,
    description: 'Return all Ad-Hoc Tasks for the plan',
    type: [AdHocTask],
  })
  async findAll(@Param('planId') planId: string): Promise<AdHocTask[]> {
    return await this.adHocTasksService.findAll(planId);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get a single Ad-Hoc Task by ID for a plan' })
  @ApiResponse({
    status: 200,
    description: 'Return the Ad-Hoc Task',
    type: AdHocTask,
  })
  @ApiResponse({ status: 404, description: 'Ad-Hoc Task not found' })
  async findOne(
    @Param('planId') planId: string,
    @Param('taskId') taskId: string,
  ): Promise<AdHocTask> {
    return await this.adHocTasksService.findOne(planId, taskId);
  }

  @Put(':taskId')
  @ApiOperation({ summary: 'Update an Ad-Hoc Task for a plan' })
  @ApiResponse({
    status: 200,
    description: 'Ad-Hoc Task updated successfully',
    type: AdHocTask,
  })
  @ApiResponse({ status: 404, description: 'Ad-Hoc Task not found' })
  async update(
    @Param('planId') planId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateAdHocTaskDto,
  ): Promise<AdHocTask> {
    return await this.adHocTasksService.update(planId, taskId, dto);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete an Ad-Hoc Task for a plan' })
  @ApiResponse({ status: 200, description: 'Ad-Hoc Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ad-Hoc Task not found' })
  async remove(
    @Param('planId') planId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    return await this.adHocTasksService.remove(planId, taskId);
  }
}
