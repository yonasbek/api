import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeeksService } from './weeks.service';
import { Week } from './entities/week.entity';

@ApiTags('Weeks')
@Controller('weeks')
export class WeeksController {
  constructor(private readonly weeksService: WeeksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new week' })
  @ApiResponse({ status: 201, description: 'Week created successfully', type: Week })
  async create(
    @Body() body: { week_number: number; year: number }
  ): Promise<Week> {
    return await this.weeksService.create(body.week_number, body.year);
  }

  @Get()
  @ApiOperation({ summary: 'Get all weeks' })
  @ApiResponse({ status: 200, description: 'Return all weeks', type: [Week] })
  async findAll(@Query('year') year?: number): Promise<Week[]> {
    if (year) {
      return await this.weeksService.findByYear(year);
    }
    return await this.weeksService.findAll();
  }

  @Get('generate/:year')
  @ApiOperation({ summary: 'Generate weeks for a specific year' })
  @ApiResponse({ status: 200, description: 'Weeks generated successfully', type: [Week] })
  async generateWeeksForYear(@Param('year') year: number): Promise<Week[]> {
    return await this.weeksService.generateWeeksForYear(year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a week by id' })
  @ApiResponse({ status: 200, description: 'Return a week', type: Week })
  async findOne(@Param('id') id: string): Promise<Week> {
    return await this.weeksService.findOne(id);
  }
}

