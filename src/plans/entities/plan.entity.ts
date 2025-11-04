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

  @ApiProperty({ example: 'John Doe', nullable: true })
  @Column({nullable: true})
  owner?: string;

  @ApiProperty({ example: 'PFRD', enum: PlanType })
  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.PFRD
  })
  plan_type: PlanType;

  @ApiProperty({ example: 'draft', description: 'Plan status: draft, active, completed, cancelled. Calculated from activities and sub-activities.' })
  @Column({default: 'draft', nullable: true})
  status?: string;

  @ApiProperty({ example: '10000' })
  @Column({default: 0})
  budget_allocated: number;

  @ApiProperty({ example: '10000' })
  @Column({default: 0})
  budget_spent: number;

  @ApiProperty({ example: ['internal', 'donor'], description: 'Budget sources: internal, donor, government, partner' })
  @Column('simple-array', { nullable: true, default: [] })
  budget_source: string[];

  @ApiProperty({ example: 0, description: 'Overall progress percentage (0-100). Calculated from activities progress.' })
  @Column('int', { default: 0 })
  progress: number;

  @OneToMany(() => Activity, activity => activity.plan)
  activities: Activity[];
} 