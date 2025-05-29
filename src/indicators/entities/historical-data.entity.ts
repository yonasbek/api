import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Indicator } from './indicator.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('historical_data')
export class HistoricalData extends BaseEntity {
  @ApiProperty({ example: '2024-01-01' })
  @Column('date')
  date: Date;

  @ApiProperty({ example: 87.5 })
  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @ManyToOne(() => Indicator, indicator => indicator.historical_data)
  indicator: Indicator;
} 