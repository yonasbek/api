import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('weeks')
@Unique(['week_number', 'year'])
export class Week extends BaseEntity {
  @ApiProperty({ example: 1 })
  @Column('int')
  week_number: number;

  @ApiProperty({ example: 2024 })
  @Column('int')
  year: number;

  @ApiProperty({ example: 'Week 1' })
  @Column()
  label: string;
}

