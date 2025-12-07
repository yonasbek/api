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
import { Role } from './entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  @Get()
  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['users'],
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  @Post()
  async create(@Body() roleData: Partial<Role>): Promise<Role> {
    const role = this.rolesRepository.create(roleData);
    return this.rolesRepository.save(role);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() roleData: Partial<Role>,
  ): Promise<Role | null> {
    await this.rolesRepository.update(id, roleData);
    return this.rolesRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.rolesRepository.delete(id);
  }
}
