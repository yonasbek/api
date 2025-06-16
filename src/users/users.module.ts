import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { DepartmentsController } from './departments.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Department } from './entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Department])],
  controllers: [UsersController, RolesController, DepartmentsController],
  exports: [TypeOrmModule],
})
export class UsersModule {} 