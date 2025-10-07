import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Trainer } from '../entities/trainer.entity';
import { Course } from '../entities/course.entity';
import { CreateTrainerDto } from '../dto/create-trainer.dto';
import { UpdateTrainerDto } from '../dto/update-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    // Check if email already exists
    const existingTrainer = await this.trainerRepository.findOne({
      where: { email: createTrainerDto.email }
    });

    if (existingTrainer) {
      throw new BadRequestException(`Trainer with email ${createTrainerDto.email} already exists`);
    }

    const trainer = this.trainerRepository.create(createTrainerDto);
    return await this.trainerRepository.save(trainer);
  }

  async findAll(): Promise<Trainer[]> {
    return await this.trainerRepository.find({
      relations: ['courses'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: ['courses']
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    return trainer;
  }

  async update(id: string, updateTrainerDto: UpdateTrainerDto): Promise<Trainer> {
    const trainer = await this.findOne(id);

    // Check if email is being changed and if it already exists
    if (updateTrainerDto.email && updateTrainerDto.email !== trainer.email) {
      const existingTrainer = await this.trainerRepository.findOne({
        where: { email: updateTrainerDto.email }
      });

      if (existingTrainer) {
        throw new BadRequestException(`Trainer with email ${updateTrainerDto.email} already exists`);
      }
    }

    Object.assign(trainer, updateTrainerDto);
    return await this.trainerRepository.save(trainer);
  }

  async remove(id: string): Promise<void> {
    const trainer = await this.findOne(id);

    // Check if trainer has assigned courses
    if (trainer.courses && trainer.courses.length > 0) {
      throw new BadRequestException('Cannot delete trainer with assigned courses');
    }

    await this.trainerRepository.remove(trainer);
  }


  async getTrainerStats(id: string): Promise<{
    total_courses: number;
    active_courses: number;
    completed_courses: number;
    total_trainees: number;
    average_rating: number;
  }> {
    const trainer = await this.findOne(id);
    const courses = trainer.courses || [];

    const total_courses = courses.length;
    const active_courses = courses.filter(c => c.is_active).length;
    const completed_courses = 0; // Simplified - no status tracking

    // Get total trainees across all courses
    const courseIds = courses.map(c => c.id);
    const total_trainees = courseIds.length > 0 
      ? await this.courseRepository
          .createQueryBuilder('course')
          .leftJoin('course.enrollments', 'enrollment')
          .where('course.id IN (:...courseIds)', { courseIds })
          .getCount()
      : 0;

    return {
      total_courses,
      active_courses,
      completed_courses,
      total_trainees,
      average_rating: 0 // This would need to be implemented based on feedback/rating system
    };
  }

  async searchTrainers(query: string): Promise<Trainer[]> {
    return await this.trainerRepository
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.courses', 'courses')
      .where('trainer.name ILIKE :query OR trainer.email ILIKE :query', {
        query: `%${query}%`
      })
      .orderBy('trainer.createdAt', 'DESC')
      .getMany();
  }

  async getAvailableTrainers(courseId?: string): Promise<Trainer[]> {
    const query = this.trainerRepository
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.courses', 'courses')
      .where('trainer.is_active = :isActive', { isActive: true });

    if (courseId) {
      // Exclude trainers already assigned to this course
      query.andWhere('trainer.id NOT IN (SELECT trainer_id FROM course_trainers WHERE course_id = :courseId)', { courseId });
    }

    return await query.orderBy('trainer.createdAt', 'DESC').getMany();
  }
}

