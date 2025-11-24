import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { TrainingsService } from '../services/trainings.service';
import { CreateTrainingDto } from '../dto/create-training.dto';
import { UpdateTrainingDto } from '../dto/update-training.dto';
import { Training } from '../entities/training.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UploadService } from '../../upload/upload.service';
import { Module } from '../../upload/upload.entity';

@ApiTags('Trainings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training' })
  @ApiResponse({ status: 201, description: 'Training created successfully', type: Training })
  async create(@Body() createTrainingDto: CreateTrainingDto): Promise<Training> {
    return await this.trainingsService.create(createTrainingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainings' })
  @ApiResponse({ status: 200, description: 'Return all trainings', type: [Training] })
  async findAll(): Promise<Training[]> {
    return await this.trainingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training by id' })
  @ApiResponse({ status: 200, description: 'Return a training', type: Training })
  @ApiResponse({ status: 404, description: 'Training not found' })
  async findOne(@Param('id') id: string): Promise<Training> {
    return await this.trainingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a training' })
  @ApiResponse({ status: 200, description: 'Training updated successfully', type: Training })
  @ApiResponse({ status: 404, description: 'Training not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ): Promise<Training> {
    return await this.trainingsService.update(id, updateTrainingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training' })
  @ApiResponse({ status: 200, description: 'Training deleted successfully' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.trainingsService.remove(id);
  }

  @Post(':id/documents/:documentType')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload documents for a training' })
  @ApiResponse({ status: 200, description: 'Documents uploaded successfully', type: Training })
  async uploadDocuments(
    @Param('id') id: string,
    @Param('documentType') documentType: 'trip_report' | 'photos' | 'attendance' | 'additional_letter',
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Training> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadedFileNames = await this.uploadService.uploadFiles(files, Module.TRAINING, false);
    return await this.trainingsService.addDocument(id, documentType, uploadedFileNames);
  }

  @Delete(':id/documents/:documentType/:fileName')
  @ApiOperation({ summary: 'Remove a document from a training' })
  @ApiResponse({ status: 200, description: 'Document removed successfully', type: Training })
  async removeDocument(
    @Param('id') id: string,
    @Param('documentType') documentType: 'trip_report' | 'photos' | 'attendance' | 'additional_letter',
    @Param('fileName') fileName: string,
  ): Promise<Training> {
    return await this.trainingsService.removeDocument(id, documentType, fileName);
  }
}

