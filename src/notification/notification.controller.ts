import { Controller, Get, Post, Param, Body, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() notificationData: Partial<Notification>) {
    return this.notificationService.create(notificationData);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.notificationService.findAllByUser(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: number) {
    return this.notificationService.markAsRead(id);
  }

  // ----- populate notifications for all existing tasks -----
  @Get('populate')
  async populateNotifications() {
    return this.notificationService.populateNotificationsForAllTasks();
  }
}
