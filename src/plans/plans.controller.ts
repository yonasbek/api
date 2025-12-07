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
} from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan, PlanType } from './entities/plan.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
    type: Plan,
  })
  async create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return await this.plansService.create(createPlanDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Return all plans', type: [Plan] })
  async getAll(): Promise<Plan[]> {
    return await this.plansService.findAll();
  }

  @Get()
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Return all plans', type: [Plan] })
  async findAll(
    @Query('fiscal_year') fiscalYear?: string,
    @Query('owner') owner?: string,
  ): Promise<Plan[]> {
    if (fiscalYear) {
      return await this.plansService.findByFiscalYear(fiscalYear);
    }
    if (owner) {
      return await this.plansService.findByOwner(owner);
    }
    return await this.plansService.findAll();
  }

  @Get('type/:planType')
  @ApiOperation({ summary: 'Get plans by type' })
  @ApiResponse({
    status: 200,
    description: 'Return plans filtered by type.',
    type: [Plan],
  })
  findByPlanType(@Param('planType') planType: PlanType) {
    return this.plansService.findByPlanType(planType);
  }

  @Get('type/:planType/fiscal-year/:fiscalYear')
  @ApiOperation({ summary: 'Get plans by type and fiscal year' })
  @ApiResponse({
    status: 200,
    description: 'Return plans filtered by type and fiscal year.',
    type: [Plan],
  })
  findByPlanTypeAndFiscalYear(
    @Param('planType') planType: PlanType,
    @Param('fiscalYear') fiscalYear: string,
  ) {
    return this.plansService.findByPlanTypeAndFiscalYear(planType, fiscalYear);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a plan by id' })
  @ApiResponse({ status: 200, description: 'Return a plan', type: Plan })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findOne(@Param('id') id: string): Promise<Plan> {
    return await this.plansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully',
    type: Plan,
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<Plan> {
    return await this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.plansService.remove(id);
  }

  @Get('statistics/overall')
  @ApiOperation({
    summary: 'Get overall statistics for all plans and activities',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns total counts and statistics for plans and activities, including breakdown by plan type',
  })
  async getOverallStatistics() {
    return await this.plansService.getOverallStatistics();
  }

  @Get('statistics/type/:planType')
  @ApiOperation({ summary: 'Get statistics for a specific plan type' })
  @ApiResponse({
    status: 200,
    description:
      'Returns detailed statistics for a specific plan type including all plans and their activities count',
  })
  async getPlanTypeStatistics(@Param('planType') planType: PlanType) {
    return await this.plansService.getPlanTypeStatistics(planType);
  }

  @Get(':id/progress-summary')
  @ApiOperation({ summary: 'Get detailed progress summary for a plan' })
  @ApiResponse({
    status: 200,
    description:
      'Returns detailed progress breakdown of plan, activities, and subactivities',
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanProgressSummary(@Param('id') id: string) {
    return await this.plansService.getPlanProgressSummary(id);
  }

  @Get(':id/debug-progress')
  @ApiOperation({ summary: 'Debug endpoint to check progress calculation' })
  @ApiResponse({
    status: 200,
    description:
      'Returns detailed debug information about progress calculation',
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async debugPlanProgress(@Param('id') id: string) {
    const plan = await this.plansService.findOne(id);

    return {
      plan_id: plan.id,
      plan_title: plan.title,
      plan_progress: plan.progress,
      calculated_progress: (plan as any).calculated_progress,
      activities_count: plan.activities?.length || 0,
      activities:
        plan.activities?.map((activity) => ({
          activity_id: activity.id,
          activity_title: activity.title,
          activity_progress: activity.progress,
          subactivities_count: activity.subactivities?.length || 0,
          subactivities:
            activity.subactivities?.map((sub) => ({
              subactivity_id: sub.id,
              subactivity_title: sub.title,
              subactivity_progress: sub.progress,
            })) || [],
        })) || [],
    };
  }
}
