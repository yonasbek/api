import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicalServicesService } from './medical-services.service';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';
import { CreateRegionalAmbulanceServiceDto } from './dto/create-regional-ambulance-service.dto';
import { UpdateRegionalAmbulanceServiceDto } from './dto/update-regional-ambulance-service.dto';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { MedicalService } from './entities/medical-service.entity';
import { RegionalAmbulanceService } from './entities/regional-ambulance-service.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportMedicalServiceCsvDto } from './dto/import-medical-service-csv.dto';
import { ImportResponseDto } from './dto/import-response.dto';
import { MedicalDashboardDto, RegionalAmbulanceDashboardDto } from './dto/dashboard.dto';
import { UniqueListResponseDto, HospitalListResponseDto } from './dto/list-response.dto';

@ApiTags('Medical Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-services')
export class MedicalServicesController {
    constructor(private readonly medicalServicesService: MedicalServicesService) { }

    // Medical Service endpoints
    @Post('medical')
    @ApiOperation({ summary: 'Create a new medical service' })
    @ApiResponse({ status: 201, description: 'Medical service created successfully', type: MedicalService })
    async createMedicalService(@Body() createMedicalServiceDto: CreateMedicalServiceDto): Promise<MedicalService> {
        return await this.medicalServicesService.createMedicalService(createMedicalServiceDto);
    }

    @Get('medical')
    @ApiOperation({ summary: 'Get all medical services' })
    @ApiResponse({ status: 200, description: 'Return all medical services', type: [MedicalService] })
    async findAllMedicalServices(): Promise<MedicalService[]> {
        return await this.medicalServicesService.findAllMedicalServices();
    }

    @Get('medical/search/region')
    @ApiOperation({ summary: 'Search medical services by region' })
    @ApiQuery({ name: 'region', description: 'Region to search for' })
    @ApiResponse({ status: 200, description: 'Return paginated medical services by region', type: PaginatedResponseDto<MedicalService> })
    async searchMedicalServicesByRegion(
        @Query('region') region: string,
        @Query() paginationDto: PaginationDto
    ): Promise<PaginatedResponseDto<MedicalService>> {
        return await this.medicalServicesService.searchMedicalServicesByRegion(region, paginationDto);
    }

    @Get('medical/search/level')
    @ApiOperation({ summary: 'Search medical services by hospital level' })
    @ApiQuery({ name: 'level', description: 'Hospital level to search for' })
    @ApiResponse({ status: 200, description: 'Return paginated medical services by level', type: PaginatedResponseDto<MedicalService> })
    async searchMedicalServicesByLevel(
        @Query('level') level: string,
        @Query() paginationDto: PaginationDto
    ): Promise<PaginatedResponseDto<MedicalService>> {
        return await this.medicalServicesService.searchMedicalServicesByLevel(level, paginationDto);
    }

    @Get('medical/dashboard')
    @ApiOperation({ summary: 'Get medical services dashboard data' })
    @ApiResponse({ status: 200, description: 'Return medical services dashboard data', type: MedicalDashboardDto })
    async getMedicalDashboard(): Promise<MedicalDashboardDto> {
        return await this.medicalServicesService.getMedicalDashboard();
    }

    @Get('medical/:id')
    @ApiOperation({ summary: 'Get a medical service by id' })
    @ApiResponse({ status: 200, description: 'Return a medical service', type: MedicalService })
    @ApiResponse({ status: 404, description: 'Medical service not found' })
    async findOneMedicalService(@Param('id') id: string): Promise<MedicalService> {
        return await this.medicalServicesService.findOneMedicalService(id);
    }

    @Patch('medical/:id')
    @ApiOperation({ summary: 'Update a medical service' })
    @ApiResponse({ status: 200, description: 'Medical service updated successfully', type: MedicalService })
    @ApiResponse({ status: 404, description: 'Medical service not found' })
    async updateMedicalService(
        @Param('id') id: string,
        @Body() updateMedicalServiceDto: UpdateMedicalServiceDto,
    ): Promise<MedicalService> {
        return await this.medicalServicesService.updateMedicalService(id, updateMedicalServiceDto);
    }

    @Delete('medical/:id')
    @ApiOperation({ summary: 'Delete a medical service' })
    @ApiResponse({ status: 200, description: 'Medical service deleted successfully' })
    @ApiResponse({ status: 404, description: 'Medical service not found' })
    async removeMedicalService(@Param('id') id: string): Promise<void> {
        return await this.medicalServicesService.removeMedicalService(id);
    }

    // Regional Ambulance Service endpoints
    @Post('regional-ambulance')
    @ApiOperation({ summary: 'Create a new regional ambulance service' })
    @ApiResponse({ status: 201, description: 'Regional ambulance service created successfully', type: RegionalAmbulanceService })
    async createRegionalAmbulanceService(@Body() createRegionalAmbulanceServiceDto: CreateRegionalAmbulanceServiceDto): Promise<RegionalAmbulanceService> {
        return await this.medicalServicesService.createRegionalAmbulanceService(createRegionalAmbulanceServiceDto);
    }

    @Get('regional-ambulance')
    @ApiOperation({ summary: 'Get all regional ambulance services with pagination' })
    @ApiResponse({ status: 200, description: 'Return paginated regional ambulance services', type: PaginatedResponseDto<RegionalAmbulanceService> })
    async findAllRegionalAmbulanceServices(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<RegionalAmbulanceService>> {
        return await this.medicalServicesService.findAllRegionalAmbulanceServices(paginationDto);
    }

    @Get('regional-ambulance/search/region')
    @ApiOperation({ summary: 'Search regional ambulance services by region' })
    @ApiQuery({ name: 'region', description: 'Region to search for' })
    @ApiResponse({ status: 200, description: 'Return paginated regional ambulance services by region', type: PaginatedResponseDto<RegionalAmbulanceService> })
    async searchRegionalAmbulanceServicesByRegion(
        @Query('region') region: string,
        @Query() paginationDto: PaginationDto
    ): Promise<PaginatedResponseDto<RegionalAmbulanceService>> {
        return await this.medicalServicesService.searchRegionalAmbulanceServicesByRegion(region, paginationDto);
    }

    @Get('regional-ambulance/dashboard')
    @ApiOperation({ summary: 'Get regional ambulance services dashboard data' })
    @ApiResponse({ status: 200, description: 'Return regional ambulance services dashboard data', type: RegionalAmbulanceDashboardDto })
    async getRegionalAmbulanceDashboard(): Promise<RegionalAmbulanceDashboardDto> {
        return await this.medicalServicesService.getRegionalAmbulanceDashboard();
    }

    @Get('regional-ambulance/:id')
    @ApiOperation({ summary: 'Get a regional ambulance service by id' })
    @ApiResponse({ status: 200, description: 'Return a regional ambulance service', type: RegionalAmbulanceService })
    @ApiResponse({ status: 404, description: 'Regional ambulance service not found' })
    async findOneRegionalAmbulanceService(@Param('id') id: string): Promise<RegionalAmbulanceService> {
        return await this.medicalServicesService.findOneRegionalAmbulanceService(id);
    }

    @Patch('regional-ambulance/:id')
    @ApiOperation({ summary: 'Update a regional ambulance service' })
    @ApiResponse({ status: 200, description: 'Regional ambulance service updated successfully', type: RegionalAmbulanceService })
    @ApiResponse({ status: 404, description: 'Regional ambulance service not found' })
    async updateRegionalAmbulanceService(
        @Param('id') id: string,
        @Body() updateRegionalAmbulanceServiceDto: UpdateRegionalAmbulanceServiceDto,
    ): Promise<RegionalAmbulanceService> {
        return await this.medicalServicesService.updateRegionalAmbulanceService(id, updateRegionalAmbulanceServiceDto);
    }

    @Delete('regional-ambulance/:id')
    @ApiOperation({ summary: 'Delete a regional ambulance service' })
    @ApiResponse({ status: 200, description: 'Regional ambulance service deleted successfully' })
    @ApiResponse({ status: 404, description: 'Regional ambulance service not found' })
    async removeRegionalAmbulanceService(@Param('id') id: string): Promise<void> {
        return await this.medicalServicesService.removeRegionalAmbulanceService(id);
    }

    // CSV Import endpoints
    @Post('medical/import-csv')
    @ApiOperation({ summary: 'Import medical services from CSV data' })
    @ApiResponse({ status: 201, description: 'CSV data imported successfully', type: ImportResponseDto })
    async importMedicalServiceCsv(@Body() csvData: ImportMedicalServiceCsvDto[]): Promise<ImportResponseDto> {
        return await this.medicalServicesService.importMedicalServiceCsv(csvData);
    }

    // Unique lists endpoints
    @Get('medical/unique/regions')
    @ApiOperation({ summary: 'Get unique list of regions' })
    @ApiResponse({ status: 200, description: 'Return unique regions list', type: UniqueListResponseDto })
    async getUniqueRegions(): Promise<UniqueListResponseDto> {
        return await this.medicalServicesService.getUniqueRegions();
    }

    @Get('medical/unique/hospitals')
    @ApiOperation({ summary: 'Get unique list of hospitals' })
    @ApiResponse({ status: 200, description: 'Return unique hospitals list', type: HospitalListResponseDto })
    async getUniqueHospitals(): Promise<HospitalListResponseDto> {
        return await this.medicalServicesService.getUniqueHospitals();
    }

    @Get('medical/unique/hospital-levels')
    @ApiOperation({ summary: 'Get unique list of hospital levels' })
    @ApiResponse({ status: 200, description: 'Return unique hospital levels list', type: UniqueListResponseDto })
    async getUniqueHospitalLevels(): Promise<UniqueListResponseDto> {
        return await this.medicalServicesService.getUniqueHospitalLevels();
    }

    @Get('medical/unique/imaging-services')
    @ApiOperation({ summary: 'Get unique list of imaging services' })
    @ApiResponse({ status: 200, description: 'Return unique imaging services list', type: UniqueListResponseDto })
    async getUniqueImagingServices(): Promise<UniqueListResponseDto> {
        return await this.medicalServicesService.getUniqueImagingServices();
    }

    @Get('medical/unique/pathology-services')
    @ApiOperation({ summary: 'Get unique list of pathology services' })
    @ApiResponse({ status: 200, description: 'Return unique pathology services list', type: UniqueListResponseDto })
    async getUniquePathologyServices(): Promise<UniqueListResponseDto> {
        return await this.medicalServicesService.getUniquePathologyServices();
    }

    @Get('medical/unique/hospitals/by-region')
    @ApiOperation({ summary: 'Get hospitals by region' })
    @ApiQuery({ name: 'region', description: 'Region to filter hospitals' })
    @ApiResponse({ status: 200, description: 'Return hospitals filtered by region', type: HospitalListResponseDto })
    async getHospitalsByRegion(@Query('region') region: string): Promise<HospitalListResponseDto> {
        return await this.medicalServicesService.searchHospitalsByRegion(region);
    }

    @Get('medical/unique/hospitals/by-level')
    @ApiOperation({ summary: 'Get hospitals by level' })
    @ApiQuery({ name: 'level', description: 'Hospital level to filter hospitals' })
    @ApiResponse({ status: 200, description: 'Return hospitals filtered by level', type: HospitalListResponseDto })
    async getHospitalsByLevel(@Query('level') level: string): Promise<HospitalListResponseDto> {
        return await this.medicalServicesService.searchHospitalsByLevel(level);
    }

    @Get('regional-ambulance/unique/regions')
    @ApiOperation({ summary: 'Get unique list of ambulance regions' })
    @ApiResponse({ status: 200, description: 'Return unique ambulance regions list', type: UniqueListResponseDto })
    async getUniqueAmbulanceRegions(): Promise<UniqueListResponseDto> {
        return await this.medicalServicesService.getUniqueAmbulanceRegions();
    }
}
