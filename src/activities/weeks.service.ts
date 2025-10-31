import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Week } from './entities/week.entity';

@Injectable()
export class WeeksService {
  constructor(
    @InjectRepository(Week)
    private weekRepository: Repository<Week>,
  ) {}

  async create(week_number: number, year: number): Promise<Week> {
    const label = `Week ${week_number}`;
    const week = this.weekRepository.create({ week_number, year, label });
    return await this.weekRepository.save(week);
  }

  async findAll(): Promise<Week[]> {
    return await this.weekRepository.find({
      order: { year: 'ASC', week_number: 'ASC' }
    });
  }

  async findByYear(year: number): Promise<Week[]> {
    return await this.weekRepository.find({
      where: { year },
      order: { week_number: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Week> {
    const week = await this.weekRepository.findOne({ where: { id } });
    if (!week) {
      throw new Error(`Week with ID ${id} not found`);
    }
    return week;
  }

  async findOrCreateByWeekNumber(week_number: number, year: number): Promise<Week> {
    let week = await this.weekRepository.findOne({
      where: { week_number, year }
    });

    if (!week) {
      week = await this.create(week_number, year);
    }

    return week;
  }

  async generateWeeksForYear(year: number): Promise<Week[]> {
    const weeks: Week[] = [];
    
    // Generate 52 weeks for the year
    for (let i = 1; i <= 52; i++) {
      const week = await this.findOrCreateByWeekNumber(i, year);
      weeks.push(week);
    }

    return weeks;
  }
}

