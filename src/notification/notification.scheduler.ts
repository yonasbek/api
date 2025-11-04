import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubActivity } from '../activities/entities/subactivity.entity';
import { NotificationService } from './notification.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, isBefore } from 'date-fns';

@Injectable()
export class NotificationScheduler {
  constructor(
    @InjectRepository(SubActivity)
    private readonly subActivityRepo: Repository<SubActivity>,
    private readonly notificationService: NotificationService,
  ) { }

  // Run every day at 8:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleNotifications() {
    const today = new Date();
    const sevenDaysLater = addDays(today, 7);

    const subActivities = await this.subActivityRepo.find({
      relations: ['user'],
    });

    for (const sub of subActivities) {
      const endDate = new Date(sub?.end_date ?? '');

      // Overdue
      if (isBefore(endDate, today)) {
        await this.notificationService.create({
          title: 'Task Overdue',
          message: `Your task "${sub.title}" is overdue.`,
          status: 'overdue',
          related_task: sub,
          user: sub.user,
        });
      }
      // Due soon (within 7 days)
      else if (endDate <= sevenDaysLater) {
        await this.notificationService.create({
          title: 'Task Due Soon',
          message: `Your task "${sub.title}" is due on ${sub.end_date}.`,
          status: 'due_soon',
          related_task: sub,
          user: sub.user,
        });
      }
    }
  }
}
