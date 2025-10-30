import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('regional_ambulance_services')
export class RegionalAmbulanceService extends BaseEntity {
    @ApiProperty({ example: 'Addis Ababa, Oromia, Amhara' })
    @Column()
    listOfRegions: string;

    @ApiProperty({ example: 500 })
    @Column('int', { default: 0 })
    noOfBeds: number;

    @ApiProperty({ example: 25 })
    @Column('int', { default: 0 })
    noOfNicuBeds: number;

    @ApiProperty({ example: 20 })
    @Column('int', { default: 0 })
    noOfPediatricsIcuBeds: number;

    @ApiProperty({ example: 50 })
    @Column('int', { default: 0 })
    noOfIcuBeds: number;

    @ApiProperty({ example: 30 })
    @Column('int', { default: 0 })
    noOfEmergencyBeds: number;

    @ApiProperty({ example: 200 })
    @Column('int', { default: 0 })
    noOfGeneralWardBeds: number;

    @ApiProperty({ example: 15 })
    @Column('int', { default: 0 })
    noOfOrTables: number;

    @ApiProperty({ example: 3 })
    @Column('int', { default: 0 })
    noOfFunctionalOxygenPlant: number;

    @ApiProperty({ example: 10 })
    @Column('int', { default: 0 })
    noOfPrivateHospitals: number;

    @ApiProperty({ example: 25 })
    @Column('int', { default: 0 })
    noOfBasicAmbulances: number;

    @ApiProperty({ example: 15 })
    @Column('int', { default: 0 })
    noOfAdvancedAmbulances: number;

    @ApiProperty({ example: 40 })
    @Column('int', { default: 0 })
    totalNoOfBasicAndAdvanced: number;

    @ApiProperty({ example: 35 })
    @Column('int', { default: 0 })
    noOfAmbulanceFunctional: number;

    @ApiProperty({ example: 3 })
    @Column('int', { default: 0 })
    noOfAmbulanceNonfunctional: number;

    @ApiProperty({ example: 2 })
    @Column('int', { default: 0 })
    noOfAmbulanceDamaged: number;

    @ApiProperty({ example: 5 })
    @Column('int', { default: 0 })
    TotalNoOfNonfunctionalAndDamgedAmbulance: number;

    @ApiProperty({ example: 8 })
    @Column('int', { default: 0 })
    noOfRefurbishedAmbulances: number;

    @ApiProperty({ example: 5 })
    @Column('int', { default: 0 })
    noOfAmbulanceDispatchCenter: number;

    @ApiProperty({ example: 3 })
    @Column('int', { default: 0 })
    noOfAmbulanceCallCenter: number;

    @ApiProperty({ example: 20 })
    @Column('int', { default: 0 })
    noOfFunctionalPrivateAmbulances: number;

    @ApiProperty({ example: 50 })
    @Column('int', { default: 0 })
    noOfParamedicsEmt: number;

    @ApiProperty({ example: 40 })
    @Column('int', { default: 0 })
    noOfParamedicsEmtWorkingOnAmbulance: number;
}

