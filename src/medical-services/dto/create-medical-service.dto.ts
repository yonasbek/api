import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsNotEmpty, Min } from 'class-validator';

export class CreateMedicalServiceDto {
    @ApiProperty({ example: 'St. Mary Hospital' })
    @IsString()
    @IsNotEmpty()
    hospitalName: string;

    @ApiProperty({ example: 'Level 3' })
    @IsString()
    @IsNotEmpty()
    levelOfHospital: string;

    @ApiProperty({ example: 'Addis Ababa' })
    @IsString()
    @IsNotEmpty()
    region: string;

    @ApiProperty({ example: 15.5 })
    @IsNumber()
    @Min(0)
    distanceFromCity: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    @Min(0)
    noOfNicuBeds: number;

    @ApiProperty({ example: 8 })
    @IsNumber()
    @Min(0)
    noOfPediatricsICUBeds: number;

    @ApiProperty({ example: 20 })
    @IsNumber()
    @Min(0)
    noOfIcuBeds: number;

    @ApiProperty({ example: 15 })
    @IsNumber()
    @Min(0)
    noOfEmergencyBeds: number;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    noOfGeneralWardBeds: number;

    @ApiProperty({ example: 5 })
    @IsNumber()
    @Min(0)
    noOfOrTables: number;

    @ApiProperty({ example: 'Basic laboratory services available' })
    @IsString()
    @IsNotEmpty()
    essentialLabratoryServicesAvailable: string;

    @ApiProperty({ example: ['X-Ray', 'CT Scan', 'MRI'] })
    @IsArray()
    @IsString({ each: true })
    typeCodeOfImagingServices: string[];

    @ApiProperty({ example: ['Blood Test', 'Biopsy', 'Cytology'] })
    @IsArray()
    @IsString({ each: true })
    typeCodeOfPatologyServices: string[];
}

