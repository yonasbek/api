import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './services/permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  async findAll(@Query('module') module?: string): Promise<Permission[]> {
    if (module) {
      return this.permissionsService.findByModule(module);
    }
    return this.permissionsService.findAll();
  }

  @Get('modules')
  async getModules(): Promise<string[]> {
    return this.permissionsService.getModules();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Permission> {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}

