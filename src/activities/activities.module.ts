import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { ActivityComment } from './entities/activity-comment.entity';
import { ActivityAttachment } from './entities/activity-attachment.entity';
import { UploadService } from '../upload/upload.service';
import { Uploads } from '../upload/upload.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityComment, ActivityAttachment, Uploads]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, UploadService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {} 