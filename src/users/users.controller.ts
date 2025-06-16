import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Get('byRole')
  async findAllByRole(@Query('roleId') roleId?: string): Promise<User[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    if (roleId) {
      queryBuilder.where('role.id = :roleId', { roleId });
    }

    return queryBuilder.getMany();
  }

  @Get('')
  async findAll(): Promise<User[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    return queryBuilder.getMany();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }
} 