import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdHocTask } from './entities/adhoc-task.entity';
import { CreateAdHocTaskDto } from './dto/create-adhoc-task.dto';
import { UpdateAdHocTaskDto } from './dto/update-adhoc-task.dto';
import { Plan } from '../plans/entities/plan.entity';

@Injectable()
export class AdHocTasksService {
  constructor(
    @InjectRepository(AdHocTask)
    private readonly adhocTaskRepository: Repository<AdHocTask>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async ensurePlanExists(planId: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }
    return plan;
  }

  async create(planId: string, dto: CreateAdHocTaskDto): Promise<AdHocTask> {
    await this.ensurePlanExists(planId);
    const entity = this.adhocTaskRepository.create({
      plan_id: planId,
      title: dto.title,
      description: dto.description,
      due_date: dto.due_date ? new Date(dto.due_date) : undefined,
      status: dto.status,
    });
    return await this.adhocTaskRepository.save(entity);
  }

  async findAll(planId: string): Promise<AdHocTask[]> {
    await this.ensurePlanExists(planId);
    return await this.adhocTaskRepository.find({ where: { plan_id: planId } });
  }

  async findOne(planId: string, taskId: string): Promise<AdHocTask> {
    await this.ensurePlanExists(planId);
    const task = await this.adhocTaskRepository.findOne({
      where: { id: taskId, plan_id: planId },
    });
    if (!task) {
      throw new NotFoundException(
        `Ad-Hoc Task with ID ${taskId} not found for plan ${planId}`,
      );
    }
    return task;
  }

  async update(
    planId: string,
    taskId: string,
    dto: UpdateAdHocTaskDto,
  ): Promise<AdHocTask> {
    const task = await this.findOne(planId, taskId);
    task.title = dto.title;
    task.description = dto.description;
    task.due_date = dto.due_date ? new Date(dto.due_date) : undefined;
    task.status = dto.status;
    return await this.adhocTaskRepository.save(task);
  }

  async remove(planId: string, taskId: string): Promise<void> {
    const task = await this.findOne(planId, taskId);
    await this.adhocTaskRepository.delete(task.id);
  }
}
