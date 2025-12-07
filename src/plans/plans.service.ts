import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, PlanType } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Activity } from '../activities/entities/activity.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    const plans = await this.planRepository.find({
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
      order: {
        created_at: 'DESC',
      },
    });

    // Calculate progress for each plan based on activities
    for (const plan of plans) {
      await this.calculatePlanProgress(plan);
    }

    return plans;
  }

  /**
   * Calculate plan progress based on activities' progress
   * Activities' progress is calculated from their subactivities
   *
   * Flow: SubActivities → Activities → Plan
   * - Each activity's progress = average of its subactivities' progress
   * - Plan's progress = average of all activities' calculated progress
   */
  private async calculatePlanProgress(plan: Plan): Promise<void> {
    console.log(`\n=== Calculating progress for plan: ${plan.title} ===`);

    if (!plan.activities || plan.activities.length === 0) {
      console.log('No activities found, setting progress to 0');
      (plan as any).calculated_progress = plan.progress || 0;
      return;
    }

    console.log(`Found ${plan.activities.length} activities`);

    // Step 1: Calculate progress for each activity from its subactivities
    plan.activities.forEach((activity, index) => {
      const oldProgress = activity.progress;
      activity.progress = this.calculateActivityProgress(activity);
      console.log(
        `Activity ${index + 1}: "${activity.title}" - Progress: ${oldProgress}% → ${activity.progress}%`,
      );
    });

    // Step 2: Calculate overall plan progress from activities
    const totalProgress = plan.activities.reduce(
      (sum, activity) => sum + (activity.progress || 0),
      0,
    );

    const calculatedProgress = Math.round(
      totalProgress / plan.activities.length,
    );
    console.log(
      `Plan total progress: ${totalProgress}, average: ${calculatedProgress}%`,
    );

    // Set both calculated_progress and progress (in-memory only, not persisted)
    (plan as any).calculated_progress = calculatedProgress;
    // Also update the progress field for convenience (won't be persisted to DB)
    plan.progress = calculatedProgress;

    console.log(
      `=== Plan "${plan.title}" final progress: ${calculatedProgress}% ===\n`,
    );
  }

  /**
   * Calculate activity progress based on subactivities
   */
  private calculateActivityProgress(activity: Activity): number {
    if (!activity.subactivities || activity.subactivities.length === 0) {
      console.log(
        `  No subactivities for "${activity.title}", using stored progress: ${activity.progress || 0}%`,
      );
      return activity.progress || 0; // Return stored progress if no subactivities
    }

    console.log(
      `  Calculating progress for "${activity.title}" from ${activity.subactivities.length} subactivities:`,
    );

    const subProgresses = activity.subactivities.map((sub) => {
      console.log(`    - "${sub.title}": ${sub.progress || 0}%`);
      return sub.progress || 0;
    });

    const totalProgress = subProgresses.reduce(
      (sum, progress) => sum + progress,
      0,
    );
    const averageProgress = Math.round(
      totalProgress / activity.subactivities.length,
    );

    console.log(`  Total: ${totalProgress}, Average: ${averageProgress}%`);

    return averageProgress;
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    // Calculate progress based on activities
    await this.calculatePlanProgress(plan);

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return await this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const result = await this.planRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }

  async findByFiscalYear(fiscalYear: string): Promise<Plan[]> {
    const plans = await this.planRepository.find({
      where: { fiscal_year: fiscalYear },
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
      order: {
        created_at: 'DESC',
      },
    });

    // Calculate progress for each plan based on activities
    for (const plan of plans) {
      await this.calculatePlanProgress(plan);
    }

    return plans;
  }

  async findByOwner(owner: string): Promise<Plan[]> {
    const plans = await this.planRepository.find({
      where: { owner },
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
      order: {
        created_at: 'DESC',
      },
    });

    // Calculate progress for each plan based on activities
    for (const plan of plans) {
      await this.calculatePlanProgress(plan);
    }

    return plans;
  }

  async findByPlanType(planType: PlanType): Promise<Plan[]> {
    const plans = await this.planRepository.find({
      where: { plan_type: planType },
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
      order: { created_at: 'DESC' },
    });

    // Calculate progress for each plan based on activities
    for (const plan of plans) {
      await this.calculatePlanProgress(plan);
    }

    return plans;
  }

  async findByPlanTypeAndFiscalYear(
    planType: PlanType,
    fiscalYear: string,
  ): Promise<Plan[]> {
    const plans = await this.planRepository.find({
      where: {
        plan_type: planType,
        fiscal_year: fiscalYear,
      },
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
      order: { created_at: 'DESC' },
    });

    // Calculate progress for each plan based on activities
    for (const plan of plans) {
      await this.calculatePlanProgress(plan);
    }

    return plans;
  }

  /**
   * Get overall statistics for all plans and activities
   */
  async getOverallStatistics(): Promise<{
    total_plans: number;
    total_activities: number;
    active_plans: number;
    completed_plans: number;
    by_plan_type: Array<{
      plan_type: PlanType;
      total_plans: number;
      total_activities: number;
      average_progress: number;
    }>;
  }> {
    const plans = await this.planRepository.find({
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
    });

    // Calculate progress for each plan
    for (const plan of plans) {
      await this.calculatePlanProgress(plan);
    }

    // Overall statistics
    const total_plans = plans.length;
    const total_activities = plans.reduce(
      (sum, plan) => sum + (plan.activities?.length || 0),
      0,
    );
    const active_plans = plans.filter((p) => p.status === 'active').length;
    const completed_plans = plans.filter(
      (p) => p.status === 'completed',
    ).length;

    // Statistics by plan type
    const planTypes = Object.values(PlanType);
    const by_plan_type = planTypes.map((planType) => {
      const plansOfType = plans.filter((p) => p.plan_type === planType);
      const activitiesOfType = plansOfType.reduce(
        (sum, plan) => sum + (plan.activities?.length || 0),
        0,
      );
      const totalProgress = plansOfType.reduce(
        (sum, plan) => sum + (plan.progress || 0),
        0,
      );
      const average_progress =
        plansOfType.length > 0
          ? Math.round(totalProgress / plansOfType.length)
          : 0;

      return {
        plan_type: planType,
        total_plans: plansOfType.length,
        total_activities: activitiesOfType,
        average_progress,
      };
    });

    return {
      total_plans,
      total_activities,
      active_plans,
      completed_plans,
      by_plan_type,
    };
  }

  /**
   * Get statistics for a specific plan type
   */
  async getPlanTypeStatistics(planType: PlanType): Promise<{
    plan_type: PlanType;
    total_plans: number;
    total_activities: number;
    active_plans: number;
    completed_plans: number;
    average_progress: number;
    plans: Array<{
      plan_id: string;
      plan_title: string;
      fiscal_year: string;
      status: string;
      progress: number;
      activities_count: number;
    }>;
  }> {
    const plans = await this.planRepository.find({
      where: { plan_type: planType },
      relations: [
        'activities',
        'activities.subactivities',
        'activities.subactivities.user',
      ],
    });

    // Calculate progress for each plan
    for (const plan of plans) {
      await this.calculatePlanProgress(plan);
    }

    const total_plans = plans.length;
    const total_activities = plans.reduce(
      (sum, plan) => sum + (plan.activities?.length || 0),
      0,
    );
    const active_plans = plans.filter((p) => p.status === 'active').length;
    const completed_plans = plans.filter(
      (p) => p.status === 'completed',
    ).length;

    const totalProgress = plans.reduce(
      (sum, plan) => sum + (plan.progress || 0),
      0,
    );
    const average_progress =
      plans.length > 0 ? Math.round(totalProgress / plans.length) : 0;

    const plansSummary = plans.map((plan) => ({
      plan_id: plan.id,
      plan_title: plan.title,
      fiscal_year: plan.fiscal_year,
      status: plan.status,
      progress: plan.progress || 0,
      activities_count: plan.activities?.length || 0,
    }));

    return {
      plan_type: planType,
      total_plans,
      total_activities,
      active_plans,
      completed_plans,
      average_progress,
      plans: plansSummary,
    };
  }

  /**
   * Get detailed progress statistics for a plan
   * Shows breakdown of activities and their progress calculated from subactivities
   */
  async getPlanProgressSummary(planId: string): Promise<{
    plan_id: string;
    plan_title: string;
    overall_progress: number;
    total_activities: number;
    activities_breakdown: Array<{
      activity_id: string;
      activity_title: string;
      activity_progress: number;
      total_subactivities: number;
      completed_subactivities: number;
    }>;
  }> {
    const plan = await this.findOne(planId);

    if (!plan.activities) {
      return {
        plan_id: plan.id,
        plan_title: plan.title,
        overall_progress: 0,
        total_activities: 0,
        activities_breakdown: [],
      };
    }

    const activities_breakdown = plan.activities.map((activity) => {
      const totalSubactivities = activity.subactivities?.length || 0;
      const completedSubactivities =
        activity.subactivities?.filter((sub) => sub.progress === 100).length ||
        0;

      return {
        activity_id: activity.id,
        activity_title: activity.title,
        activity_progress: activity.progress || 0,
        total_subactivities: totalSubactivities,
        completed_subactivities: completedSubactivities,
      };
    });

    return {
      plan_id: plan.id,
      plan_title: plan.title,
      overall_progress: plan.progress || 0,
      total_activities: plan.activities.length,
      activities_breakdown,
    };
  }
}
