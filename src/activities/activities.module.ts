import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { SubActivitiesController } from './subactivities.controller';
import { SubActivitiesService } from './subactivities.service';
import { Activity } from './entities/activity.entity';
import { ActivityComment } from './entities/activity-comment.entity';
import { ActivityAttachment } from './entities/activity-attachment.entity';
import { SubActivity } from './entities/subactivity.entity';
import { User } from '../users/entities/user.entity';
import { UploadService } from '../upload/upload.service';
import { Uploads } from '../upload/upload.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityComment,
      ActivityAttachment,
      SubActivity,
      User,
      Uploads,
    ]),
  ],
  controllers: [ActivitiesController, SubActivitiesController],
  providers: [ActivitiesService, SubActivitiesService, UploadService],
  exports: [ActivitiesService, SubActivitiesService],
})
export class ActivitiesModule {}
