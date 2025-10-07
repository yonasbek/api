import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Trainer } from '../entities/trainer.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { AssignTrainerDto } from '../dto/assign-trainer.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      relations: ['trainers', 'enrollments'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['trainers', 'enrollments', 'enrollments.trainee']
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);

    // Check if course has enrollments
    if (course.enrollments && course.enrollments.length > 0) {
      throw new BadRequestException('Cannot delete course with existing enrollments');
    }

    await this.courseRepository.remove(course);
  }


  async assignTrainers(assignTrainerDto: AssignTrainerDto): Promise<Course> {
    const course = await this.findOne(assignTrainerDto.course_id);

    // Find trainers
    const trainers = await this.trainerRepository.find({
      where: { id: In(assignTrainerDto.trainer_ids) }
    });

    if (trainers.length !== assignTrainerDto.trainer_ids.length) {
      throw new BadRequestException('One or more trainers not found');
    }

    // Check if trainers are active
    const inactiveTrainers = trainers.filter(trainer => !trainer.is_active);
    if (inactiveTrainers.length > 0) {
      throw new BadRequestException('Cannot assign inactive trainers');
    }

    course.trainers = trainers;
    return await this.courseRepository.save(course);
  }

  async removeTrainer(courseId: string, trainerId: string): Promise<Course> {
    const course = await this.findOne(courseId);

    course.trainers = course.trainers.filter(trainer => trainer.id !== trainerId);
    return await this.courseRepository.save(course);
  }

  async getCourseStats(id: string): Promise<{
    total_enrollments: number;
    completed_enrollments: number;
    in_progress_enrollments: number;
    pending_enrollments: number;
    completion_rate: number;
    average_progress: number;
  }> {
    const course = await this.findOne(id);
    const enrollments = course.enrollments || [];

    const total_enrollments = enrollments.length;
    const completed_enrollments = enrollments.filter(e => e.status === 'completed').length;
    const in_progress_enrollments = enrollments.filter(e => e.status === 'in_progress').length;
    const pending_enrollments = enrollments.filter(e => e.status === 'pending').length;

    const completion_rate = total_enrollments > 0 ? (completed_enrollments / total_enrollments) * 100 : 0;
    const average_progress = total_enrollments > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / total_enrollments 
      : 0;

    return {
      total_enrollments,
      completed_enrollments,
      in_progress_enrollments,
      pending_enrollments,
      completion_rate,
      average_progress
    };
  }

  async searchCourses(query: string): Promise<Course[]> {
    return await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.trainers', 'trainers')
      .leftJoinAndSelect('course.enrollments', 'enrollments')
      .where('course.title ILIKE :query OR course.description ILIKE :query OR course.code ILIKE :query', {
        query: `%${query}%`
      })
      .orderBy('course.createdAt', 'DESC')
      .getMany();
  }
}

