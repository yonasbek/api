import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TraineesService } from '../services/trainees.service';
import { CreateTraineeDto } from '../dto/create-trainee.dto';
import { UpdateTraineeDto } from '../dto/update-trainee.dto';
import { Trainee } from '../entities/trainee.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Trainees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trainees')
export class TraineesController {
  constructor(private readonly traineesService: TraineesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trainee' })
  @ApiResponse({ status: 201, description: 'Trainee created successfully', type: Trainee })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createTraineeDto: CreateTraineeDto): Promise<Trainee> {
    return await this.traineesService.create(createTraineeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainees' })
  @ApiResponse({ status: 200, description: 'Return all trainees', type: [Trainee] })
  @ApiQuery({ name: 'search', required: false, description: 'Search trainees by name or email' })
  async findAll(
    @Query('search') search?: string,
  ): Promise<Trainee[]> {
    if (search) {
      return await this.traineesService.searchTrainees(search);
    }
    return await this.traineesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a trainee by id' })
  @ApiResponse({ status: 200, description: 'Return a trainee', type: Trainee })
  @ApiResponse({ status: 404, description: 'Trainee not found' })
  async findOne(@Param('id') id: string): Promise<Trainee> {
    return await this.traineesService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get trainee statistics' })
  @ApiResponse({ status: 200, description: 'Return trainee statistics' })
  async getStats(@Param('id') id: string) {
    return await this.traineesService.getTraineeStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a trainee' })
  @ApiResponse({ status: 200, description: 'Trainee updated successfully', type: Trainee })
  @ApiResponse({ status: 404, description: 'Trainee not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateTraineeDto: UpdateTraineeDto,
  ): Promise<Trainee> {
    return await this.traineesService.update(id, updateTraineeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a trainee' })
  @ApiResponse({ status: 200, description: 'Trainee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trainee not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete trainee with existing enrollments' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.traineesService.remove(id);
  }
}

