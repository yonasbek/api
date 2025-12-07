import { ActivityStatus, PlanType } from '../entities/activity.entity';

export class GanttChartItemDto {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  progress: number;
  type: 'task';
  plan_type: PlanType;
  department: string;
  assigned_to: string;
  status: ActivityStatus;
  budget: number;
}
