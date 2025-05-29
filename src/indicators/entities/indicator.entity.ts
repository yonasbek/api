import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { HistoricalData } from './historical-data.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('indicators')
export class Indicator extends BaseEntity {
  @ApiProperty({ example: 'Patient Satisfaction Rate' })
  @Column()
  name: string;

  @ApiProperty({ example: 'percentage' })
  @Column()
  unit: string;

  @ApiProperty({ example: 95.0 })
  @Column('decimal', { precision: 10, scale: 2 })
  target_value: number;

  @ApiProperty({ example: 87.5 })
  @Column('decimal', { precision: 10, scale: 2 })
  current_value: number;

  @ApiProperty({ example: 'Patient Care' })
  @Column()
  category: string;

  @OneToMany(() => HistoricalData, historicalData => historicalData.indicator)
  historical_data: HistoricalData[];
} 