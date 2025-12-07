import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainee } from '../entities/trainee.entity';
import { CreateTraineeDto } from '../dto/create-trainee.dto';
import { UpdateTraineeDto } from '../dto/update-trainee.dto';

@Injectable()
export class TraineesService {
  constructor(
    @InjectRepository(Trainee)
    private traineeRepository: Repository<Trainee>,
  ) {}

  async create(createTraineeDto: CreateTraineeDto): Promise<Trainee> {
    // Check if email already exists
    const existingTrainee = await this.traineeRepository.findOne({
      where: { email: createTraineeDto.email },
    });

    if (existingTrainee) {
      throw new BadRequestException(
        `Trainee with email ${createTraineeDto.email} already exists`,
      );
    }

    const trainee = this.traineeRepository.create(createTraineeDto);
    return await this.traineeRepository.save(trainee);
  }

  async findAll(): Promise<Trainee[]> {
    return await this.traineeRepository.find({
      relations: ['enrollments', 'enrollments.course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Trainee> {
    const trainee = await this.traineeRepository.findOne({
      where: { id },
      relations: ['enrollments', 'enrollments.course'],
    });

    if (!trainee) {
      throw new NotFoundException(`Trainee with ID ${id} not found`);
    }

    return trainee;
  }

  async update(
    id: string,
    updateTraineeDto: UpdateTraineeDto,
  ): Promise<Trainee> {
    const trainee = await this.findOne(id);

    // Check if email is being changed and if it already exists
    if (updateTraineeDto.email && updateTraineeDto.email !== trainee.email) {
      const existingTrainee = await this.traineeRepository.findOne({
        where: { email: updateTraineeDto.email },
      });

      if (existingTrainee) {
        throw new BadRequestException(
          `Trainee with email ${updateTraineeDto.email} already exists`,
        );
      }
    }

    Object.assign(trainee, updateTraineeDto);
    return await this.traineeRepository.save(trainee);
  }

  async remove(id: string): Promise<void> {
    const trainee = await this.findOne(id);

    // Check if trainee has enrollments
    if (trainee.enrollments && trainee.enrollments.length > 0) {
      throw new BadRequestException(
        'Cannot delete trainee with existing enrollments',
      );
    }

    await this.traineeRepository.remove(trainee);
  }

  async getTraineeStats(id: string): Promise<{
    total_enrollments: number;
    completed_courses: number;
    in_progress_courses: number;
  }> {
    const trainee = await this.findOne(id);
    const enrollments = trainee.enrollments || [];

    const total_enrollments = enrollments.length;
    const completed_courses = enrollments.filter(
      (e) => e.status === 'completed',
    ).length;
    const in_progress_courses = enrollments.filter(
      (e) => e.status === 'in_progress',
    ).length;

    return {
      total_enrollments,
      completed_courses,
      in_progress_courses,
    };
  }

  async searchTrainees(query: string): Promise<Trainee[]> {
    return await this.traineeRepository
      .createQueryBuilder('trainee')
      .leftJoinAndSelect('trainee.enrollments', 'enrollments')
      .leftJoinAndSelect('enrollments.course', 'course')
      .where('trainee.name ILIKE :query OR trainee.email ILIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('trainee.createdAt', 'DESC')
      .getMany();
  }
}
