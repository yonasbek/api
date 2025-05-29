import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { Indicator } from './entities/indicator.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Type } from 'class-transformer';

@ApiTags('Medical Service Indicators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new indicator' })
  @ApiResponse({ status: 201, description: 'Indicator created successfully', type: Indicator })
  async create(@Body() createIndicatorDto: CreateIndicatorDto): Promise<Indicator> {
    return await this.indicatorsService.create(createIndicatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all indicators' })
  @ApiResponse({ status: 200, description: 'Return all indicators', type: [Indicator] })
  async findAll(@Query('category') category?: string): Promise<Indicator[]> {
    if (category) {
      return await this.indicatorsService.findByCategory(category);
    }
    return await this.indicatorsService.findAll();
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance summary' })
  @ApiResponse({ status: 200, description: 'Return performance summary' })
  async getPerformanceSummary(): Promise<{
    total_indicators: number;
    meeting_target: number;
    below_target: number;
    by_category: { [key: string]: { total: number; meeting_target: number } };
  }> {
    return await this.indicatorsService.getPerformanceSummary();
  }

  @Get(':id/trend')
  @ApiOperation({ summary: 'Get historical trend for an indicator' })
  @ApiResponse({ status: 200, description: 'Return historical trend data' })
  async getHistoricalTrend(
    @Param('id') id: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ): Promise<any[]> {
    return await this.indicatorsService.getHistoricalTrend(id, new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an indicator by id' })
  @ApiResponse({ status: 200, description: 'Return an indicator', type: Indicator })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async findOne(@Param('id') id: string): Promise<Indicator> {
    return await this.indicatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an indicator' })
  @ApiResponse({ status: 200, description: 'Indicator updated successfully', type: Indicator })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async update(
    @Param('id') id: string,
    @Body() updateIndicatorDto: UpdateIndicatorDto,
  ): Promise<Indicator> {
    return await this.indicatorsService.update(id, updateIndicatorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an indicator' })
  @ApiResponse({ status: 200, description: 'Indicator deleted successfully' })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.indicatorsService.remove(id);
  }
} 