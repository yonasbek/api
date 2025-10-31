import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalService } from './entities/medical-service.entity';
import { RegionalAmbulanceService } from './entities/regional-ambulance-service.entity';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';
import { CreateRegionalAmbulanceServiceDto } from './dto/create-regional-ambulance-service.dto';
import { UpdateRegionalAmbulanceServiceDto } from './dto/update-regional-ambulance-service.dto';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { ImportMedicalServiceCsvDto } from './dto/import-medical-service-csv.dto';
import { ImportResponseDto } from './dto/import-response.dto';
import {
    MedicalDashboardDto,
    DashboardCardDto,
    RegionStatsDto,
    HospitalLevelStatsDto,
    ServiceAvailabilityDto,
    ImagingServiceStatsDto,
    PathologyServiceStatsDto,
    DistanceAnalysisDto,
    RegionalAmbulanceDashboardDto,
    AmbulanceDashboardCardDto,
    AmbulanceRegionStatsDto,
    AmbulanceTypeStatsDto,
    ParamedicStatsDto,
    InfrastructureStatsDto
} from './dto/dashboard.dto';
import { UniqueListResponseDto, HospitalListResponseDto } from './dto/list-response.dto';

@Injectable()
export class MedicalServicesService {
    constructor(
        @InjectRepository(MedicalService)
        private medicalServiceRepository: Repository<MedicalService>,
        @InjectRepository(RegionalAmbulanceService)
        private regionalAmbulanceServiceRepository: Repository<RegionalAmbulanceService>,
    ) { }

    // Medical Service CRUD operations
    async createMedicalService(createMedicalServiceDto: CreateMedicalServiceDto): Promise<MedicalService> {
        const medicalService = this.medicalServiceRepository.create(createMedicalServiceDto);
        return await this.medicalServiceRepository.save(medicalService);
    }

    async findAllMedicalServices(): Promise<MedicalService[]> {
        return await this.medicalServiceRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    async findOneMedicalService(id: string): Promise<MedicalService> {
        const medicalService = await this.medicalServiceRepository.findOne({ where: { id } });
        if (!medicalService) {
            throw new NotFoundException(`Medical service with ID ${id} not found`);
        }
        return medicalService;
    }

    async updateMedicalService(id: string, updateMedicalServiceDto: UpdateMedicalServiceDto): Promise<MedicalService> {
        const medicalService = await this.findOneMedicalService(id);
        Object.assign(medicalService, updateMedicalServiceDto);
        return await this.medicalServiceRepository.save(medicalService);
    }

    async removeMedicalService(id: string): Promise<void> {
        const medicalService = await this.findOneMedicalService(id);
        await this.medicalServiceRepository.remove(medicalService);
    }

    // Regional Ambulance Service CRUD operations
    async createRegionalAmbulanceService(createRegionalAmbulanceServiceDto: CreateRegionalAmbulanceServiceDto): Promise<RegionalAmbulanceService> {
        const regionalAmbulanceService = this.regionalAmbulanceServiceRepository.create(createRegionalAmbulanceServiceDto);
        return await this.regionalAmbulanceServiceRepository.save(regionalAmbulanceService);
    }

    async findAllRegionalAmbulanceServices(paginationDto: PaginationDto): Promise<PaginatedResponseDto<RegionalAmbulanceService>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [data, total] = await this.regionalAmbulanceServiceRepository.findAndCount({
            skip,
            take: limit,
            order: { created_at: 'DESC' },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    async findOneRegionalAmbulanceService(id: string): Promise<RegionalAmbulanceService> {
        const regionalAmbulanceService = await this.regionalAmbulanceServiceRepository.findOne({ where: { id } });
        if (!regionalAmbulanceService) {
            throw new NotFoundException(`Regional ambulance service with ID ${id} not found`);
        }
        return regionalAmbulanceService;
    }

    async updateRegionalAmbulanceService(id: string, updateRegionalAmbulanceServiceDto: UpdateRegionalAmbulanceServiceDto): Promise<RegionalAmbulanceService> {
        const regionalAmbulanceService = await this.findOneRegionalAmbulanceService(id);
        Object.assign(regionalAmbulanceService, updateRegionalAmbulanceServiceDto);
        return await this.regionalAmbulanceServiceRepository.save(regionalAmbulanceService);
    }

    async removeRegionalAmbulanceService(id: string): Promise<void> {
        const regionalAmbulanceService = await this.findOneRegionalAmbulanceService(id);
        await this.regionalAmbulanceServiceRepository.remove(regionalAmbulanceService);
    }

    // Search and filter methods for Medical Services
    async searchMedicalServicesByRegion(region: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<MedicalService>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [data, total] = await this.medicalServiceRepository.findAndCount({
            where: { region },
            skip,
            take: limit,
            order: { created_at: 'DESC' },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    async searchMedicalServicesByLevel(level: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<MedicalService>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [data, total] = await this.medicalServiceRepository.findAndCount({
            where: { levelOfHospital: level },
            skip,
            take: limit,
            order: { created_at: 'DESC' },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    // Search and filter methods for Regional Ambulance Services
    async searchRegionalAmbulanceServicesByRegion(region: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<RegionalAmbulanceService>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [data, total] = await this.regionalAmbulanceServiceRepository.findAndCount({
            where: { listOfRegions: region },
            skip,
            take: limit,
            order: { created_at: 'DESC' },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    // CSV Import functionality
    async importMedicalServiceCsv(csvData: ImportMedicalServiceCsvDto[]): Promise<ImportResponseDto> {
        const totalRecords = csvData.length;
        let successfulImports = 0;
        const errors: string[] = [];

        for (let i = 0; i < csvData.length; i++) {
            try {
                const row = csvData[i];
                const medicalServiceData = this.mapCsvToMedicalService(row);

                // Check if record already exists
                const existingRecord = await this.medicalServiceRepository.findOne({
                    where: {
                        hospitalName: medicalServiceData.hospitalName,
                        region: medicalServiceData.region
                    }
                });

                if (existingRecord) {
                    // Update existing record
                    Object.assign(existingRecord, medicalServiceData);
                    await this.medicalServiceRepository.save(existingRecord);
                } else {
                    // Create new record
                    const newRecord = this.medicalServiceRepository.create(medicalServiceData);
                    await this.medicalServiceRepository.save(newRecord);
                }

                successfulImports++;
            } catch (error) {
                errors.push(`Row ${i + 2}: ${error.message}`);
            }
        }

        const failedImports = totalRecords - successfulImports;

        return {
            totalRecords,
            successfulImports,
            failedImports,
            errors,
            message: `Import completed. ${successfulImports} records processed successfully, ${failedImports} failed.`
        };
    }

    private mapCsvToMedicalService(csvRow: ImportMedicalServiceCsvDto): CreateMedicalServiceDto {
        return {
            hospitalName: csvRow['List of hospitals in the region'] || '',
            levelOfHospital: csvRow['Level of Hospitals'] || '',
            region: csvRow['region'] || '',
            distanceFromCity: this.parseNumber(csvRow['Distance from the main city']),
            noOfNicuBeds: this.parseNumber(csvRow['# of NICU beds']),
            noOfPediatricsICUBeds: this.parseNumber(csvRow['Pediatrics ICU beds']),
            noOfIcuBeds: this.parseNumber(csvRow['# of ICU beds']),
            noOfEmergencyBeds: this.parseNumber(csvRow['# of Emergency beds']),
            noOfGeneralWardBeds: this.parseNumber(csvRow['# of general ward beds']),
            noOfOrTables: this.parseNumber(csvRow['# of OR tables']),
            essentialLabratoryServicesAvailable: csvRow['Essential labratory services available as per standard'] || '',
            typeCodeOfImagingServices: this.parseArray(csvRow['Type Code of imaging Services as per standard that are given by hospitals X= X-ray,CT=CT-scan,M=MRI,U=Ultrasound,M=mamography, A =Angiography,I=interventional procedure']),
            typeCodeOfPatologyServices: this.parseArray(csvRow['Type Code of Patology Services as per standard that are given by hospital H=Histochemistry,C=Cytology,A=autopsy'])
        };
    }

    private parseNumber(value: any): number {
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        const parsed = Number(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    private parseArray(value: any): string[] {
        if (!value || value === '') {
            return [];
        }
        return value.split(',').map((item: string) => item.trim()).filter((item: string) => item);
    }

    // Dashboard methods for Medical Services
    async getMedicalDashboard(): Promise<MedicalDashboardDto> {
        const [
            totalHospitals,
            totalBeds,
            totalIcuBeds,
            totalEmergencyBeds,
            totalOrTables,
            regionStats,
            hospitalLevelStats,
            serviceAvailability,
            imagingServices,
            pathologyServices,
            distanceAnalysis
        ] = await Promise.all([
            this.getTotalHospitals(),
            this.getTotalBeds(),
            this.getTotalIcuBeds(),
            this.getTotalEmergencyBeds(),
            this.getTotalOrTables(),
            this.getRegionStats(),
            this.getHospitalLevelStats(),
            this.getServiceAvailability(),
            this.getImagingServiceStats(),
            this.getPathologyServiceStats(),
            this.getDistanceAnalysis()
        ]);

        const cards: DashboardCardDto[] = [
            {
                title: 'Total Hospitals',
                value: totalHospitals,
                change: '+5.2%',
                trend: 'up',
                colorClass: 'text-blue-600'
            },
            {
                title: 'Total Beds',
                value: totalBeds,
                change: '+3.1%',
                trend: 'up',
                colorClass: 'text-green-600'
            },
            {
                title: 'ICU Beds',
                value: totalIcuBeds,
                change: '+8.7%',
                trend: 'up',
                colorClass: 'text-red-600'
            },
            {
                title: 'Emergency Beds',
                value: totalEmergencyBeds,
                change: '+2.3%',
                trend: 'up',
                colorClass: 'text-orange-600'
            },
            {
                title: 'Operating Rooms',
                value: totalOrTables,
                change: '+1.8%',
                trend: 'up',
                colorClass: 'text-purple-600'
            }
        ];

        return {
            cards,
            regionStats,
            hospitalLevelStats,
            serviceAvailability,
            imagingServices,
            pathologyServices,
            distanceAnalysis
        };
    }

    private async getTotalHospitals(): Promise<number> {
        return await this.medicalServiceRepository.count();
    }

    private async getTotalBeds(): Promise<number> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('SUM(ms.noOfGeneralWardBeds + ms.noOfIcuBeds + ms.noOfEmergencyBeds + ms.noOfNicuBeds + ms.noOfPediatricsICUBeds)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getTotalIcuBeds(): Promise<number> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('SUM(ms.noOfIcuBeds)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getTotalEmergencyBeds(): Promise<number> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('SUM(ms.noOfEmergencyBeds)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getTotalOrTables(): Promise<number> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('SUM(ms.noOfOrTables)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getRegionStats(): Promise<RegionStatsDto[]> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select([
                'ms.region as region',
                'COUNT(*) as hospitalCount',
                'SUM(ms.noOfGeneralWardBeds + ms.noOfIcuBeds + ms.noOfEmergencyBeds + ms.noOfNicuBeds + ms.noOfPediatricsICUBeds) as totalBeds',
                'SUM(ms.noOfIcuBeds) as icuBeds',
                'SUM(ms.noOfEmergencyBeds) as emergencyBeds',
                'SUM(ms.noOfOrTables) as orTables'
            ])
            .groupBy('ms.region')
            .orderBy('hospitalCount', 'DESC')
            .getRawMany();

        return result.map(row => ({
            region: row.region,
            hospitalCount: parseInt(row.hospitalcount),
            totalBeds: parseInt(row.totalbeds) || 0,
            icuBeds: parseInt(row.icubeds) || 0,
            emergencyBeds: parseInt(row.emergencybeds) || 0,
            orTables: parseInt(row.ortables) || 0
        }));
    }

    private async getHospitalLevelStats(): Promise<HospitalLevelStatsDto[]> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select([
                'ms.levelOfHospital as level',
                'COUNT(*) as count'
            ])
            .where('ms.levelOfHospital IS NOT NULL AND ms.levelOfHospital != \'\'')
            .groupBy('ms.levelOfHospital')
            .orderBy('count', 'DESC')
            .getRawMany();

        const total = result.reduce((sum, row) => sum + parseInt(row.count), 0);

        return result.map(row => ({
            level: row.level,
            count: parseInt(row.count),
            percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100 * 10) / 10 : 0
        }));
    }

    private async getServiceAvailability(): Promise<ServiceAvailabilityDto[]> {
        const totalHospitals = await this.getTotalHospitals();

        const labServices = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('COUNT(*)', 'count')
            .where('ms.essentialLabratoryServicesAvailable = :available', { available: 'Yes' })
            .getRawOne();

        const available = parseInt(labServices.count) || 0;
        const notAvailable = totalHospitals - available;

        return [{
            service: 'Laboratory Services',
            available,
            notAvailable,
            percentage: totalHospitals > 0 ? Math.round((available / totalHospitals) * 100 * 10) / 10 : 0
        }];
    }

    private async getImagingServiceStats(): Promise<ImagingServiceStatsDto[]> {
        const allServices = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('ms.typeCodeOfImagingServices')
            .where('ms.typeCodeOfImagingServices IS NOT NULL')
            .getMany();

        const serviceCounts: { [key: string]: number } = {};
        const totalHospitals = allServices.length;

        allServices.forEach(hospital => {
            if (hospital.typeCodeOfImagingServices) {
                hospital.typeCodeOfImagingServices.forEach(service => {
                    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
                });
            }
        });

        return Object.entries(serviceCounts)
            .map(([service, count]) => ({
                service,
                count,
                percentage: totalHospitals > 0 ? Math.round((count / totalHospitals) * 100 * 10) / 10 : 0
            }))
            .sort((a, b) => b.count - a.count);
    }

    private async getPathologyServiceStats(): Promise<PathologyServiceStatsDto[]> {
        const allServices = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('ms.typeCodeOfPatologyServices')
            .where('ms.typeCodeOfPatologyServices IS NOT NULL')
            .getMany();

        const serviceCounts: { [key: string]: number } = {};
        const totalHospitals = allServices.length;

        allServices.forEach(hospital => {
            if (hospital.typeCodeOfPatologyServices) {
                hospital.typeCodeOfPatologyServices.forEach(service => {
                    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
                });
            }
        });

        return Object.entries(serviceCounts)
            .map(([service, count]) => ({
                service,
                count,
                percentage: totalHospitals > 0 ? Math.round((count / totalHospitals) * 100 * 10) / 10 : 0
            }))
            .sort((a, b) => b.count - a.count);
    }

    private async getDistanceAnalysis(): Promise<DistanceAnalysisDto[]> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select([
                'CASE ' +
                'WHEN ms.distanceFromCity <= 50 THEN \'0-50 km\' ' +
                'WHEN ms.distanceFromCity <= 100 THEN \'51-100 km\' ' +
                'WHEN ms.distanceFromCity <= 200 THEN \'101-200 km\' ' +
                'WHEN ms.distanceFromCity <= 500 THEN \'201-500 km\' ' +
                'ELSE \'500+ km\' ' +
                'END as range',
                'COUNT(*) as count'
            ])
            .groupBy('range')
            .orderBy('count', 'DESC')
            .getRawMany();

        const total = result.reduce((sum, row) => sum + parseInt(row.count), 0);

        return result.map(row => ({
            range: row.range,
            count: parseInt(row.count),
            percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100 * 10) / 10 : 0
        }));
    }

    // Dashboard methods for Regional Ambulance Services
    async getRegionalAmbulanceDashboard(): Promise<RegionalAmbulanceDashboardDto> {
        const [
            totalAmbulances,
            functionalAmbulances,
            totalParamedics,
            workingParamedics,
            regionStats,
            ambulanceTypeStats,
            infrastructureStats
        ] = await Promise.all([
            this.getTotalAmbulances(),
            this.getFunctionalAmbulances(),
            this.getTotalParamedics(),
            this.getWorkingParamedics(),
            this.getAmbulanceRegionStats(),
            this.getAmbulanceTypeStats(),
            this.getInfrastructureStats()
        ]);

        const cards: AmbulanceDashboardCardDto[] = [
            {
                title: 'Total Ambulances',
                value: totalAmbulances,
                change: '+12.3%',
                trend: 'up',
                colorClass: 'text-blue-600'
            },
            {
                title: 'Functional Ambulances',
                value: functionalAmbulances,
                change: '+8.7%',
                trend: 'up',
                colorClass: 'text-green-600'
            },
            {
                title: 'Total Paramedics',
                value: totalParamedics,
                change: '+15.2%',
                trend: 'up',
                colorClass: 'text-purple-600'
            },
            {
                title: 'Working Paramedics',
                value: workingParamedics,
                change: '+11.8%',
                trend: 'up',
                colorClass: 'text-orange-600'
            }
        ];

        const paramedicStats: ParamedicStatsDto = {
            title: 'Paramedic Utilization',
            total: totalParamedics,
            workingOnAmbulance: workingParamedics,
            utilizationRate: totalParamedics > 0 ? Math.round((workingParamedics / totalParamedics) * 100 * 10) / 10 : 0
        };

        return {
            cards,
            regionStats,
            ambulanceTypeStats,
            paramedicStats,
            infrastructureStats
        };
    }

    private async getTotalAmbulances(): Promise<number> {
        const result = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select('SUM(ras.noOfBasicAmbulances + ras.noOfAdvancedAmbulances)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getFunctionalAmbulances(): Promise<number> {
        const result = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select('SUM(ras.noOfAmbulanceFunctional)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getTotalParamedics(): Promise<number> {
        const result = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select('SUM(ras.noOfParamedicsEmt)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getWorkingParamedics(): Promise<number> {
        const result = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select('SUM(ras.noOfParamedicsEmtWorkingOnAmbulance)', 'total')
            .getRawOne();
        return parseInt(result.total) || 0;
    }

    private async getAmbulanceRegionStats(): Promise<AmbulanceRegionStatsDto[]> {
        const result = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select([
                'ras.listOfRegions as region',
                'SUM(ras.noOfBasicAmbulances + ras.noOfAdvancedAmbulances) as totalAmbulances',
                'SUM(ras.noOfAmbulanceFunctional) as functionalAmbulances',
                'SUM(ras.noOfAmbulanceNonfunctional) as nonFunctionalAmbulances',
                'SUM(ras.noOfAmbulanceDamaged) as damagedAmbulances'
            ])
            .groupBy('ras.listOfRegions')
            .orderBy('totalAmbulances', 'DESC')
            .getRawMany();

        return result.map(row => {
            const total = parseInt(row.totalambulances) || 0;
            const functional = parseInt(row.functionalambulances) || 0;
            return {
                region: row.region,
                totalAmbulances: total,
                functionalAmbulances: functional,
                nonFunctionalAmbulances: parseInt(row.nonfunctionalambulances) || 0,
                damagedAmbulances: parseInt(row.damagedambulances) || 0,
                functionalityRate: total > 0 ? Math.round((functional / total) * 100 * 10) / 10 : 0
            };
        });
    }

    private async getAmbulanceTypeStats(): Promise<AmbulanceTypeStatsDto[]> {
        const basicResult = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select('SUM(ras.noOfBasicAmbulances)', 'total')
            .getRawOne();

        const advancedResult = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select('SUM(ras.noOfAdvancedAmbulances)', 'total')
            .getRawOne();

        const basic = parseInt(basicResult.total) || 0;
        const advanced = parseInt(advancedResult.total) || 0;
        const total = basic + advanced;

        return [
            {
                type: 'Basic Ambulances',
                count: basic,
                percentage: total > 0 ? Math.round((basic / total) * 100 * 10) / 10 : 0
            },
            {
                type: 'Advanced Ambulances',
                count: advanced,
                percentage: total > 0 ? Math.round((advanced / total) * 100 * 10) / 10 : 0
            }
        ];
    }

    private async getInfrastructureStats(): Promise<InfrastructureStatsDto[]> {
        const [dispatchCenters, callCenters, oxygenPlants, privateHospitals] = await Promise.all([
            this.regionalAmbulanceServiceRepository
                .createQueryBuilder('ras')
                .select('SUM(ras.noOfAmbulanceDispatchCenter)', 'total')
                .getRawOne(),
            this.regionalAmbulanceServiceRepository
                .createQueryBuilder('ras')
                .select('SUM(ras.noOfAmbulanceCallCenter)', 'total')
                .getRawOne(),
            this.regionalAmbulanceServiceRepository
                .createQueryBuilder('ras')
                .select('SUM(ras.noOfFunctionalOxygenPlant)', 'total')
                .getRawOne(),
            this.regionalAmbulanceServiceRepository
                .createQueryBuilder('ras')
                .select('SUM(ras.noOfPrivateHospitals)', 'total')
                .getRawOne()
        ]);

        return [
            {
                facility: 'Dispatch Centers',
                count: parseInt(dispatchCenters.total) || 0,
                colorClass: 'text-blue-600'
            },
            {
                facility: 'Call Centers',
                count: parseInt(callCenters.total) || 0,
                colorClass: 'text-green-600'
            },
            {
                facility: 'Oxygen Plants',
                count: parseInt(oxygenPlants.total) || 0,
                colorClass: 'text-red-600'
            },
            {
                facility: 'Private Hospitals',
                count: parseInt(privateHospitals.total) || 0,
                colorClass: 'text-purple-600'
            }
        ];
    }

    // Unique lists methods
    async getUniqueRegions(): Promise<UniqueListResponseDto> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('DISTINCT ms.region', 'region')
            .where('ms.region IS NOT NULL AND ms.region != \'\'')
            .orderBy('ms.region', 'ASC')
            .getRawMany();

        const regions = result.map(row => row.region);

        return {
            data: regions,
            total: regions.length,
            message: 'Unique regions list'
        };
    }

    async getUniqueHospitals(): Promise<HospitalListResponseDto> {
        const hospitals = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select([
                'ms.id as id',
                'ms.hospitalName as name',
                'ms.region as region',
                'ms.levelOfHospital as levelOfHospital'
            ])
            .where('ms.hospitalName IS NOT NULL AND ms.hospitalName != \'\'')
            .orderBy('ms.hospitalName', 'ASC')
            .getRawMany();

        const hospitalData = hospitals.map(hospital => ({
            id: hospital.id,
            name: hospital.name,
            region: hospital.region,
            levelOfHospital: hospital.levelOfHospital
        }));

        return {
            data: hospitalData,
            total: hospitalData.length,
            message: 'Hospitals list'
        };
    }

    async getUniqueHospitalLevels(): Promise<UniqueListResponseDto> {
        const result = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('DISTINCT ms.levelOfHospital', 'level')
            .where('ms.levelOfHospital IS NOT NULL AND ms.levelOfHospital != \'\'')
            .orderBy('ms.levelOfHospital', 'ASC')
            .getRawMany();

        const levels = result.map(row => row.level);

        return {
            data: levels,
            total: levels.length,
            message: 'Unique hospital levels list'
        };
    }

    async getUniqueImagingServices(): Promise<UniqueListResponseDto> {
        const allServices = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('ms.typeCodeOfImagingServices')
            .where('ms.typeCodeOfImagingServices IS NOT NULL')
            .getMany();

        const serviceSet = new Set<string>();
        allServices.forEach(hospital => {
            if (hospital.typeCodeOfImagingServices) {
                hospital.typeCodeOfImagingServices.forEach(service => {
                    serviceSet.add(service);
                });
            }
        });

        const services = Array.from(serviceSet).sort();

        return {
            data: services,
            total: services.length,
            message: 'Unique imaging services list'
        };
    }

    async getUniquePathologyServices(): Promise<UniqueListResponseDto> {
        const allServices = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select('ms.typeCodeOfPatologyServices')
            .where('ms.typeCodeOfPatologyServices IS NOT NULL')
            .getMany();

        const serviceSet = new Set<string>();
        allServices.forEach(hospital => {
            if (hospital.typeCodeOfPatologyServices) {
                hospital.typeCodeOfPatologyServices.forEach(service => {
                    serviceSet.add(service);
                });
            }
        });

        const services = Array.from(serviceSet).sort();

        return {
            data: services,
            total: services.length,
            message: 'Unique pathology services list'
        };
    }

    async searchHospitalsByRegion(region: string): Promise<HospitalListResponseDto> {
        const hospitals = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select([
                'ms.id as id',
                'ms.hospitalName as name',
                'ms.region as region',
                'ms.levelOfHospital as levelOfHospital'
            ])
            .where('ms.region = :region', { region })
            .andWhere('ms.hospitalName IS NOT NULL AND ms.hospitalName != \'\'')
            .orderBy('ms.hospitalName', 'ASC')
            .getRawMany();

        const hospitalData = hospitals.map(hospital => ({
            id: hospital.id,
            name: hospital.name,
            region: hospital.region,
            levelOfHospital: hospital.levelOfHospital
        }));

        return {
            data: hospitalData,
            total: hospitalData.length,
            message: `Hospitals in ${region} region`
        };
    }

    async searchHospitalsByLevel(level: string): Promise<HospitalListResponseDto> {
        const hospitals = await this.medicalServiceRepository
            .createQueryBuilder('ms')
            .select([
                'ms.id as id',
                'ms.hospitalName as name',
                'ms.region as region',
                'ms.levelOfHospital as levelOfHospital'
            ])
            .where('ms.levelOfHospital = :level', { level })
            .andWhere('ms.hospitalName IS NOT NULL AND ms.hospitalName != \'\'')
            .orderBy('ms.hospitalName', 'ASC')
            .getRawMany();

        const hospitalData = hospitals.map(hospital => ({
            id: hospital.id,
            name: hospital.name,
            region: hospital.region,
            levelOfHospital: hospital.levelOfHospital
        }));

        return {
            data: hospitalData,
            total: hospitalData.length,
            message: `Hospitals with ${level} level`
        };
    }

    async getUniqueAmbulanceRegions(): Promise<UniqueListResponseDto> {
        const result = await this.regionalAmbulanceServiceRepository
            .createQueryBuilder('ras')
            .select('DISTINCT ras.listOfRegions', 'region')
            .where('ras.listOfRegions IS NOT NULL AND ras.listOfRegions != \'\'')
            .orderBy('ras.listOfRegions', 'ASC')
            .getRawMany();

        const regions = result.map(row => row.region);

        return {
            data: regions,
            total: regions.length,
            message: 'Unique ambulance regions list'
        };
    }
}
