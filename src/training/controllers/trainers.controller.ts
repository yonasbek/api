import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainersService } from '../services/trainers.service';
import { CreateTrainerDto } from '../dto/create-trainer.dto';
import { UpdateTrainerDto } from '../dto/update-trainer.dto';
import { Trainer } from '../entities/trainer.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trainer' })
  @ApiResponse({ status: 201, description: 'Trainer created successfully', type: Trainer })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    return await this.trainersService.create(createTrainerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainers' })
  @ApiResponse({ status: 200, description: 'Return all trainers', type: [Trainer] })
  @ApiQuery({ name: 'search', required: false, description: 'Search trainers by name or email' })
  @ApiQuery({ name: 'available', required: false, type: 'boolean', description: 'Get only available trainers' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Get available trainers for a specific course' })
  async findAll(
    @Query('search') search?: string,
    @Query('available') available?: boolean,
    @Query('courseId') courseId?: string,
  ): Promise<Trainer[]> {
    if (available) {
      return await this.trainersService.getAvailableTrainers(courseId);
    }
    if (search) {
      return await this.trainersService.searchTrainers(search);
    }
    return await this.trainersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a trainer by id' })
  @ApiResponse({ status: 200, description: 'Return a trainer', type: Trainer })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  async findOne(@Param('id') id: string): Promise<Trainer> {
    return await this.trainersService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get trainer statistics' })
  @ApiResponse({ status: 200, description: 'Return trainer statistics' })
  async getStats(@Param('id') id: string) {
    return await this.trainersService.getTrainerStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a trainer' })
  @ApiResponse({ status: 200, description: 'Trainer updated successfully', type: Trainer })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    return await this.trainersService.update(id, updateTrainerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a trainer' })
  @ApiResponse({ status: 200, description: 'Trainer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete trainer with assigned courses' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.trainersService.remove(id);
  }
}

