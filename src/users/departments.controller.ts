import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Controller('departments')
export class DepartmentsController {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  @Get()
  async findAll(): Promise<Department[]> {
    return this.departmentsRepository.find({
      relations: ['users'],
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Department | null> {
    return this.departmentsRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  @Post()
  async create(
    @Body() departmentData: Partial<Department>,
  ): Promise<Department> {
    const department = this.departmentsRepository.create(departmentData);
    return this.departmentsRepository.save(department);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() departmentData: Partial<Department>,
  ): Promise<Department | null> {
    await this.departmentsRepository.update(id, departmentData);
    return this.departmentsRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.departmentsRepository.delete(id);
  }
}
