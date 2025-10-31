import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Not, MoreThan } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { SubActivity, ActivityStatus } from '../activities/entities/subactivity.entity';
import { User } from '../users/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(SubActivity)
    private readonly subActivityRepository: Repository<SubActivity>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ----- create notification -----
  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return this.notificationRepository.save(notification);
  }

  // ----- notifications by user -----
  async findAllByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      relations: ['related_task', 'user'],
    });
  }

  // ----- mark as read -----
  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.is_read = true;
    return this.notificationRepository.save(notification);
  }

  // ----- inline task notification -----
  async notifyTaskIfDue(task: SubActivity): Promise<void> {
    if (!task.end_date || task.status === ActivityStatus.COMPLETED) return;

    const today = new Date();
    const endDate = new Date(task.end_date);
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays <= 7) {
      const user = await this.userRepository.findOne({ where: { id: task.user_id } });
      if (!user) return;

      const title = task.title ?? 'Task notification';
      const message =
        diffDays < 0
          ? `Task "${task.title}" is overdue by ${Math.abs(diffDays)} day(s).`
          : `Task "${task.title}" is due in ${diffDays} day(s).`;

      const category = diffDays < 0 ? 'overdue' : 'due_soon';
      const existing = await this.notificationRepository.findOne({
        where: { related_task: { id: task.id }, category },
      });

      if (!existing) {
        await this.create({
          title,
          message,
          category,
          related_task: task,
          user,
        });
      }
    }
  }

  // ----- cron job -----
  @Cron(CronExpression.EVERY_HOUR)
  async checkOverdueTasks(): Promise<void> {
    this.logger.log('Running cron job to check overdue tasks...');

    const today = new Date();

    const tasks = await this.subActivityRepository.find({
      where: { status: Not(ActivityStatus.COMPLETED) },
      relations: ['user'],
    });

    for (const task of tasks) {
      await this.notifyTaskIfDue(task);
    }

    this.logger.log(`Cron job created notifications for ${tasks.length} tasks.`);
  }

  // ----- populate notifications for all existing tasks -----
  async populateNotificationsForAllTasks(): Promise<{ created: number }> {
    const today = new Date();
    const tasks = await this.subActivityRepository.find({
      where: { status: Not(ActivityStatus.COMPLETED) },
      relations: ['user'],
    });

    let createdCount = 0;
    for (const task of tasks) {
      const endDate = new Date(task.end_date);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let category: string | null = null;

      if (diffDays < 0) category = 'overdue';
      else if (diffDays <= 7) category = 'due_soon';
      if (!category) continue;

      const existing = await this.notificationRepository.findOne({
        where: { related_task: { id: task.id }, category },
      });
      if (!existing) {
        const message =
          diffDays < 0
            ? `Task "${task.title}" is overdue by ${Math.abs(diffDays)} day(s).`
            : `Task "${task.title}" is due in ${diffDays} day(s).`;

        await this.create({
          title: task.title ?? 'Task notification',
          message,
          category,
          related_task: task,
          user: task.user,
        });
        createdCount++;
      }
    }

    this.logger.log(`Populated ${createdCount} notifications for existing tasks.`);
    return { created: createdCount };
  }
}
