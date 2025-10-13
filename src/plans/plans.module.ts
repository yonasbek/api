import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { Plan } from './entities/plan.entity';
import { Activity } from '../activities/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Activity])],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {} 