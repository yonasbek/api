import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, PlanType } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    return await this.planRepository.find({
      relations: ['activities'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['activities'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return await this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const result = await this.planRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }

  async findByFiscalYear(fiscalYear: string): Promise<Plan[]> {
    return await this.planRepository.find({
      where: { fiscal_year: fiscalYear },
      relations: ['activities'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByOwner(owner: string): Promise<Plan[]> {
    return await this.planRepository.find({
      where: { owner },
      relations: ['activities'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  findByPlanType(planType: PlanType) {
    return this.planRepository.find({
      where: { plan_type: planType },
      order: { created_at: 'DESC' }
    });
  }

  findByPlanTypeAndFiscalYear(planType: PlanType, fiscalYear: string) {
    return this.planRepository.find({
      where: { 
        plan_type: planType,
        fiscal_year: fiscalYear
      },
      order: { created_at: 'DESC' }
    });
  }
} 