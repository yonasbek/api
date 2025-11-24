import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from '../entities/training.entity';
import { CreateTrainingDto } from '../dto/create-training.dto';
import { UpdateTrainingDto } from '../dto/update-training.dto';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectRepository(Training)
    private trainingRepository: Repository<Training>,
  ) {}

  async create(createTrainingDto: CreateTrainingDto): Promise<Training> {
    // Validate dates
    if (createTrainingDto.start_date > createTrainingDto.end_date) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const training = this.trainingRepository.create(createTrainingDto);
    return await this.trainingRepository.save(training);
  }

  async findAll(): Promise<Training[]> {
    return await this.trainingRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Training> {
    const training = await this.trainingRepository.findOne({
      where: { id },
    });

    if (!training) {
      throw new NotFoundException(`Training with ID ${id} not found`);
    }

    return training;
  }

  async update(id: string, updateTrainingDto: UpdateTrainingDto): Promise<Training> {
    const training = await this.findOne(id);

    // Validate dates if both are provided
    if (updateTrainingDto.start_date && updateTrainingDto.end_date) {
      if (new Date(updateTrainingDto.start_date) > new Date(updateTrainingDto.end_date)) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    } else if (updateTrainingDto.start_date && training.end_date) {
      if (new Date(updateTrainingDto.start_date) > new Date(training.end_date)) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    } else if (updateTrainingDto.end_date && training.start_date) {
      if (new Date(training.start_date) > new Date(updateTrainingDto.end_date)) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    }

    Object.assign(training, updateTrainingDto);
    return await this.trainingRepository.save(training);
  }

  async remove(id: string): Promise<void> {
    const training = await this.findOne(id);
    await this.trainingRepository.remove(training);
  }

  async addDocument(
    id: string,
    documentType: 'trip_report' | 'photos' | 'attendance' | 'additional_letter',
    fileNames: string[],
  ): Promise<Training> {
    const training = await this.findOne(id);
    const currentFiles = training[documentType] || [];
    training[documentType] = [...currentFiles, ...fileNames];
    return await this.trainingRepository.save(training);
  }

  async removeDocument(
    id: string,
    documentType: 'trip_report' | 'photos' | 'attendance' | 'additional_letter',
    fileName: string,
  ): Promise<Training> {
    const training = await this.findOne(id);
    const currentFiles = training[documentType] || [];
    training[documentType] = currentFiles.filter((file) => file !== fileName);
    return await this.trainingRepository.save(training);
  }
}

