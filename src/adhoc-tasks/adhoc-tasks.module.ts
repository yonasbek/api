import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdHocTasksController } from './adhoc-tasks.controller';
import { AdHocTasksService } from './adhoc-tasks.service';
import { AdHocTask } from './entities/adhoc-task.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdHocTask, Plan])],
  controllers: [AdHocTasksController],
  providers: [AdHocTasksService],
  exports: [AdHocTasksService],
})
export class AdHocTasksModule {}
