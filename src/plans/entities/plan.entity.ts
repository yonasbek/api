import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PlanType {
  PFRD = 'PFRD',
  ECCD = 'ECCD',
  HDD = 'HDD',
  SRD = 'SRD',
  LEO = 'LEO'
}

@Entity('plans')
export class Plan extends BaseEntity {
  @ApiProperty({ example: 'Annual Development Plan 2024' })
  @Column()
  title: string;

  @ApiProperty({ example: '2024' })
  @Column()
  fiscal_year: string;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  owner: string;

  @ApiProperty({ example: 'PFRD', enum: PlanType })
  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.PFRD
  })
  plan_type: PlanType;

  @ApiProperty({ example: 'draft' })
  @Column({default: 'draft'})
  status: string;

  @ApiProperty({ example: '10000' })
  @Column({default: 0})
  budget_allocated: number;

  @ApiProperty({ example: '10000' })
  @Column({default: 0})
  budget_spent: number;

  @OneToMany(() => Activity, activity => activity.plan)
  activities: Activity[];
} 