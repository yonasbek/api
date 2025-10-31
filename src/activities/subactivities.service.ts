import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubActivity } from './entities/subactivity.entity';
import { Activity, ActivityStatus } from './entities/activity.entity';
import { User } from '../users/entities/user.entity';
import { Week } from './entities/week.entity';
import { CreateSubActivityDto } from './dto/create-subactivity.dto';
import { UpdateSubActivityDto } from './dto/update-subactivity.dto';
import { UpdateSubActivityProgressDto } from './dto/update-subactivity-progress.dto';

@Injectable()
export class SubActivitiesService {
  constructor(
    @InjectRepository(SubActivity)
    private subActivityRepository: Repository<SubActivity>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Week)
    private weekRepository: Repository<Week>,
  ) {}

  async create(createSubActivityDto: CreateSubActivityDto): Promise<SubActivity> {
    // Verify the parent activity exists
    const activity = await this.activityRepository.findOne({
      where: { id: createSubActivityDto.activity_id }
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${createSubActivityDto.activity_id} not found`);
    }

    // Verify the user exists
    const user = await this.userRepository.findOne({
      where: { id: createSubActivityDto.user_id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createSubActivityDto.user_id} not found`);
    }

    // Verify the weeks exist
    const startWeek = await this.weekRepository.findOne({
      where: { id: createSubActivityDto.start_week_id }
    });

    if (!startWeek) {
      throw new NotFoundException(`Week with ID ${createSubActivityDto.start_week_id} not found`);
    }

    const endWeek = await this.weekRepository.findOne({
      where: { id: createSubActivityDto.end_week_id }
    });

    if (!endWeek) {
      throw new NotFoundException(`Week with ID ${createSubActivityDto.end_week_id} not found`);
    }

    const subActivity = this.subActivityRepository.create(createSubActivityDto);
    return await this.subActivityRepository.save(subActivity);
  }

  async findAll(): Promise<SubActivity[]> {
    return await this.subActivityRepository.find({
      relations: ['activity', 'user', 'start_week', 'end_week'],
      order: { created_at: 'ASC' }
    });
  }

  async findByActivityId(activityId: string): Promise<SubActivity[]> {
    return await this.subActivityRepository.find({
      where: { activity_id: activityId },
      relations: ['activity', 'user', 'start_week', 'end_week'],
      order: { created_at: 'ASC' }
    });
  }

  async findByUserId(userId: string): Promise<SubActivity[]> {
    return await this.subActivityRepository.find({
      where: { user_id: userId },
      relations: ['activity', 'user', 'start_week', 'end_week'],
      order: { created_at: 'ASC' }
    });
  }

  async findByUserEmail(userEmail: string): Promise<SubActivity[]> {
    const user = await this.userRepository.findOne({
      where: { email: userEmail }
    });

    if (!user) {
      return [];
    }

    return await this.subActivityRepository.find({
      where: { user_id: user.id },
      relations: ['activity', 'user', 'start_week', 'end_week'],
      order: { created_at: 'ASC' }
    });
  }

  async findOne(id: string): Promise<SubActivity> {
    const subActivity = await this.subActivityRepository.findOne({
      where: { id },
      relations: ['activity', 'user', 'start_week', 'end_week']
    });

    if (!subActivity) {
      throw new NotFoundException(`SubActivity with ID ${id} not found`);
    }

    return subActivity;
  }

  async update(id: string, updateSubActivityDto: UpdateSubActivityDto): Promise<SubActivity> {
    const subActivity = await this.findOne(id);

    // If user_id is being updated, verify the new user exists
    if (updateSubActivityDto.user_id && updateSubActivityDto.user_id !== subActivity.user_id) {
      const user = await this.userRepository.findOne({
        where: { id: updateSubActivityDto.user_id }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${updateSubActivityDto.user_id} not found`);
      }
    }

    // If start_week_id is being updated, verify the week exists
    if (updateSubActivityDto.start_week_id && updateSubActivityDto.start_week_id !== subActivity.start_week_id) {
      const startWeek = await this.weekRepository.findOne({
        where: { id: updateSubActivityDto.start_week_id }
      });

      if (!startWeek) {
        throw new NotFoundException(`Week with ID ${updateSubActivityDto.start_week_id} not found`);
      }
    }

    // If end_week_id is being updated, verify the week exists
    if (updateSubActivityDto.end_week_id && updateSubActivityDto.end_week_id !== subActivity.end_week_id) {
      const endWeek = await this.weekRepository.findOne({
        where: { id: updateSubActivityDto.end_week_id }
      });

      if (!endWeek) {
        throw new NotFoundException(`Week with ID ${updateSubActivityDto.end_week_id} not found`);
      }
    }

    Object.assign(subActivity, updateSubActivityDto);
    return await this.subActivityRepository.save(subActivity);
  }

  async updateProgress(id: string, updateProgressDto: UpdateSubActivityProgressDto, userId?: string): Promise<SubActivity> {
    const subActivity = await this.findOne(id);

    // Check if user is authorized to update this subactivity
    if (userId && subActivity.user_id !== userId) {
      throw new ForbiddenException('You can only update your own subactivities');
    }

    // Update progress and status
    subActivity.progress = updateProgressDto.progress;
    
    if (updateProgressDto.status) {
      subActivity.status = updateProgressDto.status;
    }

    if (updateProgressDto.notes) {
      subActivity.notes = updateProgressDto.notes;
    }

    // Auto-update status based on progress
    if (updateProgressDto.progress === 100) {
      subActivity.status = ActivityStatus.COMPLETED;
    } else if (updateProgressDto.progress > 0) {
      subActivity.status = ActivityStatus.IN_PROGRESS;
    }
    else if (updateProgressDto.progress === 0) {
      subActivity.status = ActivityStatus.NOT_STARTED;
    }

    return await this.subActivityRepository.save(subActivity);
  }

  async remove(id: string): Promise<void> {
    const subActivity = await this.findOne(id);
    await this.subActivityRepository.remove(subActivity);
  }

  async getSubActivityStats(activityId: string): Promise<{
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
    average_progress: number;
  }> {
    const subActivities = await this.findByActivityId(activityId);
    
    const total = subActivities.length;
    const completed = subActivities.filter(sa => sa.status === ActivityStatus.COMPLETED).length;
    const in_progress = subActivities.filter(sa => sa.status === ActivityStatus.IN_PROGRESS).length;
    const not_started = subActivities.filter(sa => sa.status === ActivityStatus.NOT_STARTED).length;
    
    const average_progress = total > 0 
      ? subActivities.reduce((sum, sa) => sum + sa.progress, 0) / total 
      : 0;

    return {
      total,
      completed,
      in_progress,
      not_started,
      average_progress: Math.round(average_progress)
    };
  }
} 