import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Indicator } from './entities/indicator.entity';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';

@Injectable()
export class IndicatorsService {
  constructor(
    @InjectRepository(Indicator)
    private indicatorRepository: Repository<Indicator>,
  ) {}

  async create(createIndicatorDto: CreateIndicatorDto): Promise<Indicator> {
    const indicator = this.indicatorRepository.create(createIndicatorDto);
    return await this.indicatorRepository.save(indicator);
  }

  async findAll(): Promise<Indicator[]> {
    return await this.indicatorRepository.find({
      relations: ['historical_data'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Indicator> {
    const indicator = await this.indicatorRepository.findOne({
      where: { id },
      relations: ['historical_data'],
    });

    if (!indicator) {
      throw new NotFoundException(`Indicator with ID ${id} not found`);
    }

    return indicator;
  }

  async update(id: string, updateIndicatorDto: UpdateIndicatorDto): Promise<Indicator> {
    const indicator = await this.findOne(id);
    Object.assign(indicator, updateIndicatorDto);
    return await this.indicatorRepository.save(indicator);
  }

  async remove(id: string): Promise<void> {
    const result = await this.indicatorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Indicator with ID ${id} not found`);
    }
  }

  async findByCategory(category: string): Promise<Indicator[]> {
    return await this.indicatorRepository.find({
      where: { category },
      relations: ['historical_data'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async getPerformanceSummary(): Promise<{
    total_indicators: number;
    meeting_target: number;
    below_target: number;
    by_category: { [key: string]: { total: number; meeting_target: number } };
  }> {
    const indicators = await this.findAll();
    const total_indicators = indicators.length;
    const meeting_target = indicators.filter(i => i.current_value >= i.target_value).length;
    const below_target = total_indicators - meeting_target;

    const by_category: { [key: string]: { total: number; meeting_target: number } } = {};
    indicators.forEach(indicator => {
      if (!by_category[indicator.category]) {
        by_category[indicator.category] = { total: 0, meeting_target: 0 };
      }
      by_category[indicator.category].total++;
      if (indicator.current_value >= indicator.target_value) {
        by_category[indicator.category].meeting_target++;
      }
    });

    return {
      total_indicators,
      meeting_target,
      below_target,
      by_category,
    };
  }

  async getHistoricalTrend(id: string, startDate: Date, endDate: Date): Promise<any[]> {
    const indicator = await this.findOne(id);
    return await this.indicatorRepository
      .createQueryBuilder('indicator')
      .leftJoinAndSelect('indicator.historical_data', 'historical_data')
      .where('historical_data.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('historical_data.date', 'ASC')
      .getMany();
  }
} 