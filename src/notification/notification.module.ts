// src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { SubActivity } from '../activities/entities/subactivity.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, SubActivity, User]),
    ScheduleModule.forRoot(), // enable cron scheduling
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
