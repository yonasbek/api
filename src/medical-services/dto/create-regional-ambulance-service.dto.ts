import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateRegionalAmbulanceServiceDto {
    @ApiProperty({ example: 'Addis Ababa, Oromia, Amhara' })
    @IsString()
    @IsNotEmpty()
    listOfRegions: string;

    @ApiProperty({ example: 500 })
    @IsNumber()
    @Min(0)
    noOfBeds: number;

    @ApiProperty({ example: 25 })
    @IsNumber()
    @Min(0)
    noOfNicuBeds: number;

    @ApiProperty({ example: 20 })
    @IsNumber()
    @Min(0)
    noOfPediatricsIcuBeds: number;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(0)
    noOfIcuBeds: number;

    @ApiProperty({ example: 30 })
    @IsNumber()
    @Min(0)
    noOfEmergencyBeds: number;

    @ApiProperty({ example: 200 })
    @IsNumber()
    @Min(0)
    noOfGeneralWardBeds: number;

    @ApiProperty({ example: 15 })
    @IsNumber()
    @Min(0)
    noOfOrTables: number;

    @ApiProperty({ example: 3 })
    @IsNumber()
    @Min(0)
    noOfFunctionalOxygenPlant: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    @Min(0)
    noOfPrivateHospitals: number;

    @ApiProperty({ example: 25 })
    @IsNumber()
    @Min(0)
    noOfBasicAmbulances: number;

    @ApiProperty({ example: 15 })
    @IsNumber()
    @Min(0)
    noOfAdvancedAmbulances: number;

    @ApiProperty({ example: 40 })
    @IsNumber()
    @Min(0)
    totalNoOfBasicAndAdvanced: number;

    @ApiProperty({ example: 35 })
    @IsNumber()
    @Min(0)
    noOfAmbulanceFunctional: number;

    @ApiProperty({ example: 3 })
    @IsNumber()
    @Min(0)
    noOfAmbulanceNonfunctional: number;

    @ApiProperty({ example: 2 })
    @IsNumber()
    @Min(0)
    noOfAmbulanceDamaged: number;

    @ApiProperty({ example: 5 })
    @IsNumber()
    @Min(0)
    TotalNoOfNonfunctionalAndDamgedAmbulance: number;

    @ApiProperty({ example: 8 })
    @IsNumber()
    @Min(0)
    noOfRefurbishedAmbulances: number;

    @ApiProperty({ example: 5 })
    @IsNumber()
    @Min(0)
    noOfAmbulanceDispatchCenter: number;

    @ApiProperty({ example: 3 })
    @IsNumber()
    @Min(0)
    noOfAmbulanceCallCenter: number;

    @ApiProperty({ example: 20 })
    @IsNumber()
    @Min(0)
    noOfFunctionalPrivateAmbulances: number;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(0)
    noOfParamedicsEmt: number;

    @ApiProperty({ example: 40 })
    @IsNumber()
    @Min(0)
    noOfParamedicsEmtWorkingOnAmbulance: number;
}

