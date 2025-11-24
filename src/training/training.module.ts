import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingsController } from './controllers/trainings.controller';
import { TrainingsService } from './services/trainings.service';
import { Training } from './entities/training.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training]),
    UploadModule
  ],
  controllers: [
    TrainingsController
  ],
  providers: [
    TrainingsService
  ],
  exports: [
    TrainingsService
  ]
})
export class TrainingModule {}



