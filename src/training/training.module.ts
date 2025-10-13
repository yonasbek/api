import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './controllers/courses.controller';
import { TrainersController } from './controllers/trainers.controller';
import { TraineesController } from './controllers/trainees.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { CoursesService } from './services/courses.service';
import { TrainersService } from './services/trainers.service';
import { TraineesService } from './services/trainees.service';
import { EnrollmentsService } from './services/enrollments.service';
import { Course } from './entities/course.entity';
import { Trainer } from './entities/trainer.entity';
import { Trainee } from './entities/trainee.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Trainer, Trainee, CourseEnrollment])
  ],
  controllers: [
    CoursesController,
    TrainersController,
    TraineesController,
    EnrollmentsController
  ],
  providers: [
    CoursesService,
    TrainersService,
    TraineesService,
    EnrollmentsService
  ],
  exports: [
    CoursesService,
    TrainersService,
    TraineesService,
    EnrollmentsService
  ]
})
export class TrainingModule {}



