import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEnrollment, EnrollmentStatus } from '../entities/course-enrollment.entity';
import { Course } from '../entities/course.entity';
import { Trainee } from '../entities/trainee.entity';
import { EnrollTraineeDto } from '../dto/enroll-trainee.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Trainee)
    private traineeRepository: Repository<Trainee>,
  ) {}

  async enrollTrainee(enrollTraineeDto: EnrollTraineeDto): Promise<CourseEnrollment> {
    // Check if course exists and is available for enrollment
    const course = await this.courseRepository.findOne({
      where: { id: enrollTraineeDto.course_id }
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${enrollTraineeDto.course_id} not found`);
    }

    if (!course.is_active) {
      throw new BadRequestException('Course is not active');
    }

    // if (course.status !== 'published') {
    //   throw new BadRequestException('Course is not available for enrollment');
    // }

    // Check if trainee exists
    const trainee = await this.traineeRepository.findOne({
      where: { id: enrollTraineeDto.trainee_id }
    });

    if (!trainee) {
      throw new NotFoundException(`Trainee with ID ${enrollTraineeDto.trainee_id} not found`);
    }

    if (!trainee.is_active) {
      throw new BadRequestException('Trainee is not active');
    }

    // Check if trainee is already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        course_id: enrollTraineeDto.course_id,
        trainee_id: enrollTraineeDto.trainee_id
      }
    });

    if (existingEnrollment) {
      throw new BadRequestException('Trainee is already enrolled in this course');
    }

    // Check course capacity
    const currentEnrollments = await this.enrollmentRepository.count({
      where: { course_id: enrollTraineeDto.course_id }
    });

    // if (course.max_participants > 0 && currentEnrollments >= course.max_participants) {
    //   throw new BadRequestException('Course is at maximum capacity');
    // }

    // // Check registration deadline
    // if (course.registration_deadline && new Date() > course.registration_deadline) {
    //   throw new BadRequestException('Registration deadline has passed');
    // }

    const enrollmentData = {
      course_id: enrollTraineeDto.course_id,
      trainee_id: enrollTraineeDto.trainee_id,
      status: EnrollmentStatus.PENDING,
      enrolled_at: new Date(),
      attendance_required: enrollTraineeDto.attendance_required || false,
      total_sessions: enrollTraineeDto.total_sessions || 0,
      payment_required: enrollTraineeDto.payment_required || false,
      amount_paid: enrollTraineeDto.amount_paid || undefined,
      payment_method: enrollTraineeDto.payment_method || undefined,
      payment_reference: enrollTraineeDto.payment_reference || undefined,
      notes: enrollTraineeDto.notes || undefined
    };

    const enrollment = this.enrollmentRepository.create(enrollmentData);

    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<CourseEnrollment[]> {
    return await this.enrollmentRepository.find({
      relations: ['course', 'trainee'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<CourseEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['course', 'trainee']
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<CourseEnrollment> {
    const enrollment = await this.findOne(id);

    // Validate progress percentage
    if (updateEnrollmentDto.progress_percentage !== undefined) {
      if (updateEnrollmentDto.progress_percentage < 0 || updateEnrollmentDto.progress_percentage > 100) {
        throw new BadRequestException('Progress percentage must be between 0 and 100');
      }
    }

    // Validate final grade
    if (updateEnrollmentDto.final_grade !== undefined) {
      if (updateEnrollmentDto.final_grade < 0 || updateEnrollmentDto.final_grade > 100) {
        throw new BadRequestException('Final grade must be between 0 and 100');
      }
    }

    // Auto-update status based on progress
    if (updateEnrollmentDto.progress_percentage !== undefined && updateEnrollmentDto.progress_percentage === 100 && enrollment.status !== 'completed') {
      updateEnrollmentDto.status = EnrollmentStatus.COMPLETED;
      updateEnrollmentDto.completed_at = new Date();
    } else if (updateEnrollmentDto.progress_percentage !== undefined && updateEnrollmentDto.progress_percentage > 0 && enrollment.status === 'pending') {
      updateEnrollmentDto.status = EnrollmentStatus.IN_PROGRESS;
      if (!enrollment.started_at) {
        updateEnrollmentDto.started_at = new Date();
      }
    }

    Object.assign(enrollment, updateEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);

    // Check if enrollment can be cancelled
    if (enrollment.status === 'completed') {
      throw new BadRequestException('Cannot cancel completed enrollment');
    }

    await this.enrollmentRepository.remove(enrollment);
  }

  async findByCourse(courseId: string): Promise<CourseEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { course_id: courseId },
      relations: ['trainee'],
      order: { enrolled_at: 'DESC' }
    });
  }

  async findByTrainee(traineeId: string): Promise<CourseEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { trainee_id: traineeId },
      relations: ['course'],
      order: { enrolled_at: 'DESC' }
    });
  }

  async findByStatus(status: EnrollmentStatus): Promise<CourseEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { status },
      relations: ['course', 'trainee'],
      order: { enrolled_at: 'DESC' }
    });
  }

  async getEnrollmentStats(): Promise<{
    total_enrollments: number;
    pending_enrollments: number;
    confirmed_enrollments: number;
    in_progress_enrollments: number;
    completed_enrollments: number;
    cancelled_enrollments: number;
    completion_rate: number;
  }> {
    const enrollments = await this.enrollmentRepository.find();

    const total_enrollments = enrollments.length;
    const pending_enrollments = enrollments.filter(e => e.status === 'pending').length;
    const confirmed_enrollments = enrollments.filter(e => e.status === 'confirmed').length;
    const in_progress_enrollments = enrollments.filter(e => e.status === 'in_progress').length;
    const completed_enrollments = enrollments.filter(e => e.status === 'completed').length;
    const cancelled_enrollments = enrollments.filter(e => e.status === 'cancelled').length;

    const completion_rate = total_enrollments > 0 ? (completed_enrollments / total_enrollments) * 100 : 0;

    return {
      total_enrollments,
      pending_enrollments,
      confirmed_enrollments,
      in_progress_enrollments,
      completed_enrollments,
      cancelled_enrollments,
      completion_rate
    };
  }

  async confirmEnrollment(id: string): Promise<CourseEnrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status !== 'pending') {
      throw new BadRequestException('Only pending enrollments can be confirmed');
    }

    enrollment.status = EnrollmentStatus.CONFIRMED;
    return await this.enrollmentRepository.save(enrollment);
  }

  async cancelEnrollment(id: string): Promise<CourseEnrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status === 'completed') {
      throw new BadRequestException('Cannot cancel completed enrollment');
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    return await this.enrollmentRepository.save(enrollment);
  }
}
