import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  create(@Body() createReminderDto: CreateReminderDto) {
    return this.remindersService.create(createReminderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders' })
  @ApiResponse({ status: 200, description: 'Returns all reminders' })
  findAll() {
    return this.remindersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID' })
  @ApiResponse({ status: 200, description: 'Returns the reminder' })
  findOne(@Param('id') id: string) {
    return this.remindersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update reminder' })
  @ApiResponse({ status: 200, description: 'Reminder updated successfully' })
  update(@Param('id') id: string, @Body() updateReminderDto: UpdateReminderDto) {
    return this.remindersService.update(id, updateReminderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reminder' })
  @ApiResponse({ status: 200, description: 'Reminder deleted successfully' })
  remove(@Param('id') id: string) {
    return this.remindersService.remove(id);
  }
} 