import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Activity, ActivityStatus, PlanType } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { GanttChartItemDto } from './dto/gantt-chart.dto';
import { UploadService } from '../upload/upload.service';
import { Module } from '../upload/upload.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private uploadService: UploadService,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create(createActivityDto);
    return await this.activityRepository.save(activity);
  }

  async uploadSupportingDocuments(id: string, files: Express.Multer.File[]): Promise<Activity> {
    const activity = await this.findOne(id);
    
    const uploadedFiles = await this.uploadService.uploadFiles(files, Module.ACTIVITY);
    
    // Merge new files with existing ones
    const existingFiles = activity.supporting_documents || [];
    activity.supporting_documents = [...existingFiles, ...uploadedFiles];
    
    return await this.activityRepository.save(activity);
  }

  async removeSupportingDocument(id: string, fileName: string): Promise<Activity> {
    const activity = await this.findOne(id);
    
    if (!activity.supporting_documents?.includes(fileName)) {
      throw new BadRequestException(`File ${fileName} not found in activity's supporting documents`);
    }

    // Remove file from storage
    await this.uploadService.deleteFiles([fileName]);

    // Remove file from activity's supporting documents
    activity.supporting_documents = activity.supporting_documents.filter(
      (doc) => doc !== fileName
    );

    return await this.activityRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    const activities = await this.activityRepository.find({
      relations: ['plan', 'comments', 'attachments', 'reminders', 'subactivities', 'subactivities.user'],
      order: {
        start_date: 'ASC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities;
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['plan', 'comments', 'attachments', 'reminders', 'subactivities', 'subactivities.user'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    // Calculate progress from subactivities
    activity.progress = this.calculateActivityProgress(activity);

    return activity;
  }

  /**
   * Calculate activity progress based on subactivities
   */
  private calculateActivityProgress(activity: Activity): number {
    if (!activity.subactivities || activity.subactivities.length === 0) {
      return activity.progress || 0; // Return stored progress if no subactivities
    }

    const totalProgress = activity.subactivities.reduce(
      (sum, subactivity) => sum + (subactivity.progress || 0),
      0
    );

    return Math.round(totalProgress / activity.subactivities.length);
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);
    
    // Validate dates if they are being updated
    if (updateActivityDto.start_date && updateActivityDto.end_date) {
      if (new Date(updateActivityDto.start_date) > new Date(updateActivityDto.end_date)) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    }

    // Validate progress value
    if (updateActivityDto.progress !== undefined) {
      if (updateActivityDto.progress < 0 || updateActivityDto.progress > 100) {
        throw new BadRequestException('Progress must be between 0 and 100');
      }
    }

    // If supporting_documents are being updated, validate they exist
    if (updateActivityDto.supporting_documents) {
      for (const fileName of updateActivityDto.supporting_documents) {
        try {
          await this.uploadService.getFilePath(fileName);
        } catch {
          throw new BadRequestException(`File ${fileName} not found`);
        }
      }
    }

    Object.assign(activity, updateActivityDto);
    return await this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    
    // Delete associated files if any
    if (activity.supporting_documents?.length) {
      await this.uploadService.deleteFiles(activity.supporting_documents);
    }

    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
  }

  async findByPlanId(planId: string): Promise<Activity[]> {
    const activities = await this.activityRepository.find({
      where: { plan_id: planId },
      relations: ['comments', 'attachments', 'reminders', 'subactivities', 'subactivities.user'],
      order: {
        start_date: 'ASC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities;
  }

  async findFlagshipActivities(): Promise<Activity[]> {
    const activities = await this.activityRepository.find({
      where: { flagship_activity: true },
      relations: ['plan', 'subactivities', 'subactivities.user', 'subactivities.start_week', 'subactivities.end_week'],
      order: {
        created_at: 'DESC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Activity[]> {
    const activities = await this.activityRepository.find({
      where: {
        start_date: MoreThanOrEqual(startDate),
        end_date: LessThanOrEqual(endDate),
      },
      relations: ['plan', 'comments', 'attachments', 'reminders', 'subactivities', 'subactivities.user'],
      order: {
        start_date: 'ASC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities;
  }

  async findByStatus(status: ActivityStatus): Promise<Activity[]> {
    const activities = await this.activityRepository.find({
      where: { status },
      relations: ['plan', 'comments', 'attachments', 'reminders', 'subactivities', 'subactivities.user'],
      order: {
        start_date: 'ASC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities;
  }

  async findByPlanType(planType: PlanType): Promise<Activity[]> {
    const activities = await this.activityRepository.find({
      where: { plan_type: planType },
      relations: ['plan', 'comments', 'attachments', 'reminders', 'subactivities', 'subactivities.user'],
      order: {
        start_date: 'ASC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities;
  }

  async findByPlanYear(year: string): Promise<Activity[]> {
    const activities = await this.activityRepository.find({
      where: { plan_year: year },
      relations: ['plan', 'comments', 'attachments', 'reminders', 'subactivities', 'subactivities.user'],
      order: {
        start_date: 'ASC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities;
  }

  async getBudgetSummary(planId: string): Promise<{
    total_allocated: number;
    total_spent: number;
    remaining: number;
  }> {
    const activities = await this.findByPlanId(planId);
    const total_allocated = activities.reduce((sum, activity) => sum + Number(activity.budget_allocated), 0);
    const total_spent = activities.reduce((sum, activity) => sum + Number(activity.budget_spent), 0);

    return {
      total_allocated,
      total_spent,
      remaining: total_allocated - total_spent,
    };
  }

  async getProgressSummary(planId: string): Promise<{
    total_activities: number;
    not_started: number;
    in_progress: number;
    completed: number;
    delayed: number;
    average_progress: number;
  }> {
    const activities = await this.findByPlanId(planId);
    const total_activities = activities.length;
    
    const statusCount = activities.reduce((acc, activity) => {
      acc[activity.status]++;
      return acc;
    }, {
      NOT_STARTED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      DELAYED: 0,
    });

    // Progress is now calculated from subactivities in findByPlanId
    const total_progress = activities.reduce((sum, activity) => sum + activity.progress, 0);
    const average_progress = total_activities > 0 ? Math.round(total_progress / total_activities) : 0;

    return {
      total_activities,
      not_started: statusCount.NOT_STARTED,
      in_progress: statusCount.IN_PROGRESS,
      completed: statusCount.COMPLETED,
      delayed: statusCount.DELAYED,
      average_progress,
    };
  }

  async getGanttChartData(): Promise<GanttChartItemDto[]> {
    const activities = await this.activityRepository.find({
      relations: ['plan', 'subactivities', 'subactivities.user'],
      order: {
        start_date: 'ASC',
      },
    });

    // Calculate progress for each activity based on subactivities
    activities.forEach(activity => {
      activity.progress = this.calculateActivityProgress(activity);
    });

    return activities.map(activity => ({
      id: activity.id,
      text: activity.title,
      start_date: activity.start_date,
      end_date: activity.end_date,
      progress: activity.progress / 100, // Convert percentage to decimal
      type: 'task',
      plan_type: activity.plan_type,
      department: activity.responsible_department,
      assigned_to: activity.assigned_person,
      status: activity.status,
      budget: activity.budget_allocated,
    }));
  }
} 