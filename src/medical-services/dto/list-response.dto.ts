import { ApiProperty } from '@nestjs/swagger';

export class UniqueListResponseDto {
  @ApiProperty({ example: ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray'] })
  data: string[];

  @ApiProperty({ example: 4 })
  total: number;

  @ApiProperty({ example: 'Unique regions list' })
  message: string;
}

export class HospitalListResponseDto {
  @ApiProperty({ 
    example: [
      { id: 'uuid-1', name: 'St. Mary Hospital', region: 'Addis Ababa' },
      { id: 'uuid-2', name: 'Tikur Anbessa Hospital', region: 'Addis Ababa' }
    ]
  })
  data: Array<{
    id: string;
    name: string;
    region: string;
    levelOfHospital: string;
  }>;

  @ApiProperty({ example: 2 })
  total: number;

  @ApiProperty({ example: 'Hospitals list' })
  message: string;
}
