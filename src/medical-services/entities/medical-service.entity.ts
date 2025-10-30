import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('medical_services')
export class MedicalService extends BaseEntity {
    @ApiProperty({ example: 'St. Mary Hospital' })
    @Column()
    hospitalName: string;

    @ApiProperty({ example: 'Level 3' })
    @Column('text', { nullable: true })
    levelOfHospital: string;

    @ApiProperty({ example: 'Addis Ababa' })
    @Column()
    region: string;

    @ApiProperty({ example: 15.5 })
    @Column('decimal', { precision: 10, scale: 2 })
    distanceFromCity: number;

    @ApiProperty({ example: 10 })
    @Column('int', { default: 0 })
    noOfNicuBeds: number;

    @ApiProperty({ example: 8 })
    @Column('int', { default: 0 })
    noOfPediatricsICUBeds: number;

    @ApiProperty({ example: 20 })
    @Column('int', { default: 0 })
    noOfIcuBeds: number;

    @ApiProperty({ example: 15 })
    @Column('int', { default: 0 })
    noOfEmergencyBeds: number;

    @ApiProperty({ example: 100 })
    @Column('int', { default: 0 })
    noOfGeneralWardBeds: number;

    @ApiProperty({ example: 5 })
    @Column('int', { default: 0 })
    noOfOrTables: number;

    @ApiProperty({ example: 'Basic laboratory services available' })
    @Column('text', { nullable: true })
    essentialLabratoryServicesAvailable: string;

    @ApiProperty({ example: ['X-Ray', 'CT Scan', 'MRI'] })
    @Column('simple-array', { nullable: true })
    typeCodeOfImagingServices: string[];

    @ApiProperty({ example: ['Blood Test', 'Biopsy', 'Cytology'] })
    @Column('simple-array', { nullable: true })
    typeCodeOfPatologyServices: string[];
}

