import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Trainee } from './trainee.entity';

export enum EnrollmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

@Entity('course_enrollments')
export class CourseEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  course_id: string;

  @Column({ type: 'uuid' })
  trainee_id: string;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus;

  @Column({ type: 'timestamp', nullable: true })
  enrolled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'int', default: 0 })
  progress_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  final_grade: number;

  @Column({ type: 'text', nullable: true })
  certificate_url: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'boolean', default: false })
  attendance_required: boolean;

  @Column({ type: 'int', default: 0 })
  attendance_count: number;

  @Column({ type: 'int', default: 0 })
  total_sessions: number;

  @Column({ type: 'boolean', default: false })
  payment_required: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount_paid: number;

  @Column({ type: 'timestamp', nullable: true })
  payment_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_method: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_reference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, course => course.enrollments)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Trainee, trainee => trainee.enrollments)
  @JoinColumn({ name: 'trainee_id' })
  trainee: Trainee;
}



