import { ApiProperty } from '@nestjs/swagger';

export class DashboardCardDto {
    @ApiProperty({ example: 'Total Hospitals' })
    title: string;

    @ApiProperty({ example: 392 })
    value: number;

    @ApiProperty({ example: '+5.2%' })
    change?: string;

    @ApiProperty({ example: 'up' })
    trend?: 'up' | 'down' | 'neutral';

    @ApiProperty({ example: 'text-green-600' })
    colorClass?: string;
}

export class RegionStatsDto {
    @ApiProperty({ example: 'Addis Ababa' })
    region: string;

    @ApiProperty({ example: 45 })
    hospitalCount: number;

    @ApiProperty({ example: 1250 })
    totalBeds: number;

    @ApiProperty({ example: 85 })
    icuBeds: number;

    @ApiProperty({ example: 120 })
    emergencyBeds: number;

    @ApiProperty({ example: 25 })
    orTables: number;
}

export class HospitalLevelStatsDto {
    @ApiProperty({ example: 'Comprehensive Specialized Hospital' })
    level: string;

    @ApiProperty({ example: 25 })
    count: number;

    @ApiProperty({ example: 35.5 })
    percentage: number;
}

export class ServiceAvailabilityDto {
    @ApiProperty({ example: 'Laboratory Services' })
    service: string;

    @ApiProperty({ example: 280 })
    available: number;

    @ApiProperty({ example: 112 })
    notAvailable: number;

    @ApiProperty({ example: 71.4 })
    percentage: number;
}

export class ImagingServiceStatsDto {
    @ApiProperty({ example: 'X-Ray' })
    service: string;

    @ApiProperty({ example: 250 })
    count: number;

    @ApiProperty({ example: 63.8 })
    percentage: number;
}

export class PathologyServiceStatsDto {
    @ApiProperty({ example: 'Histochemistry' })
    service: string;

    @ApiProperty({ example: 180 })
    count: number;

    @ApiProperty({ example: 45.9 })
    percentage: number;
}

export class DistanceAnalysisDto {
    @ApiProperty({ example: '0-50 km' })
    range: string;

    @ApiProperty({ example: 120 })
    count: number;

    @ApiProperty({ example: 30.6 })
    percentage: number;
}

export class MedicalDashboardDto {
    @ApiProperty({ type: [DashboardCardDto] })
    cards: DashboardCardDto[];

    @ApiProperty({ type: [RegionStatsDto] })
    regionStats: RegionStatsDto[];

    @ApiProperty({ type: [HospitalLevelStatsDto] })
    hospitalLevelStats: HospitalLevelStatsDto[];

    @ApiProperty({ type: [ServiceAvailabilityDto] })
    serviceAvailability: ServiceAvailabilityDto[];

    @ApiProperty({ type: [ImagingServiceStatsDto] })
    imagingServices: ImagingServiceStatsDto[];

    @ApiProperty({ type: [PathologyServiceStatsDto] })
    pathologyServices: PathologyServiceStatsDto[];

    @ApiProperty({ type: [DistanceAnalysisDto] })
    distanceAnalysis: DistanceAnalysisDto[];
}

// Regional Ambulance Dashboard DTOs
export class AmbulanceDashboardCardDto {
    @ApiProperty({ example: 'Total Ambulances' })
    title: string;

    @ApiProperty({ example: 450 })
    value: number;

    @ApiProperty({ example: '+12.3%' })
    change?: string;

    @ApiProperty({ example: 'up' })
    trend?: 'up' | 'down' | 'neutral';

    @ApiProperty({ example: 'text-blue-600' })
    colorClass?: string;
}

export class AmbulanceRegionStatsDto {
    @ApiProperty({ example: 'Addis Ababa' })
    region: string;

    @ApiProperty({ example: 85 })
    totalAmbulances: number;

    @ApiProperty({ example: 75 })
    functionalAmbulances: number;

    @ApiProperty({ example: 8 })
    nonFunctionalAmbulances: number;

    @ApiProperty({ example: 2 })
    damagedAmbulances: number;

    @ApiProperty({ example: 88.2 })
    functionalityRate: number;
}

export class AmbulanceTypeStatsDto {
    @ApiProperty({ example: 'Basic Ambulances' })
    type: string;

    @ApiProperty({ example: 300 })
    count: number;

    @ApiProperty({ example: 66.7 })
    percentage: number;
}

export class ParamedicStatsDto {
    @ApiProperty({ example: 'Total Paramedics' })
    title: string;

    @ApiProperty({ example: 250 })
    total: number;

    @ApiProperty({ example: 200 })
    workingOnAmbulance: number;

    @ApiProperty({ example: 80.0 })
    utilizationRate: number;
}

export class InfrastructureStatsDto {
    @ApiProperty({ example: 'Dispatch Centers' })
    facility: string;

    @ApiProperty({ example: 15 })
    count: number;

    @ApiProperty({ example: 'text-green-600' })
    colorClass: string;
}

export class RegionalAmbulanceDashboardDto {
    @ApiProperty({ type: [AmbulanceDashboardCardDto] })
    cards: AmbulanceDashboardCardDto[];

    @ApiProperty({ type: [AmbulanceRegionStatsDto] })
    regionStats: AmbulanceRegionStatsDto[];

    @ApiProperty({ type: [AmbulanceTypeStatsDto] })
    ambulanceTypeStats: AmbulanceTypeStatsDto[];

    @ApiProperty({ type: ParamedicStatsDto })
    paramedicStats: ParamedicStatsDto;

    @ApiProperty({ type: [InfrastructureStatsDto] })
    infrastructureStats: InfrastructureStatsDto[];
}
