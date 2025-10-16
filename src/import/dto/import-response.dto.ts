import { ApiProperty } from '@nestjs/swagger';

export class ImportResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'Employee Data Import' })
  name: string;

  @ApiProperty({ example: 'employee_data.csv' })
  filename: string;

  @ApiProperty({ example: 150 })
  totalRows: number;

  @ApiProperty({ example: 5 })
  totalColumns: number;

  @ApiProperty({ example: '["name", "email", "department", "salary", "hire_date"]' })
  headers: string[];

  @ApiProperty({ example: 'SUCCESS' })
  status: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}
