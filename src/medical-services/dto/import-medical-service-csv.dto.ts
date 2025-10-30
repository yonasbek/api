import { ApiProperty } from '@nestjs/swagger';

export class ImportMedicalServiceCsvDto {
  @ApiProperty({ example: 'Addis Ababa' })
  region: string;

  @ApiProperty({ example: 'Dagmawi Minilik Hospital' })
  'List of hospitals in the region': string;

  @ApiProperty({ example: 'Comprehensive Specialized Hospital' })
  'Level of Hospitals': string;

  @ApiProperty({ example: 0 })
  'Distance from the main city': string;

  @ApiProperty({ example: 28 })
  '# of NICU beds': string;

  @ApiProperty({ example: 0 })
  'Pediatrics ICU beds': string;

  @ApiProperty({ example: 8 })
  '# of ICU beds': string;

  @ApiProperty({ example: 23 })
  '# of Emergency beds': string;

  @ApiProperty({ example: 370 })
  '# of general ward beds': string;

  @ApiProperty({ example: 18 })
  '# of OR tables': string;

  @ApiProperty({ example: 'Yes' })
  'Essential labratory services available as per standard': string;

  @ApiProperty({ example: 'X,U' })
  'Type Code of imaging Services as per standard that are given by hospitals X= X-ray,CT=CT-scan,M=MRI,U=Ultrasound,M=mamography, A =Angiography,I=interventional procedure': string;

  @ApiProperty({ example: 'C,A' })
  'Type Code of Patology Services as per standard that are given by hospital H=Histochemistry,C=Cytology,A=autopsy': string;
}

