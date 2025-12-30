import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { DepartmentsController } from './departments.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Department } from './entities/department.entity';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, Department])],
  controllers: [UsersController, RolesController, PermissionsController, DepartmentsController],
  providers: [RolesService, PermissionsService],
  exports: [TypeOrmModule, RolesService, PermissionsService],
})
export class UsersModule {} 