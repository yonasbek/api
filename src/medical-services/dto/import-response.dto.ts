import { ApiProperty } from '@nestjs/swagger';

export class ImportResponseDto {
  @ApiProperty({ example: 392 })
  totalRecords: number;

  @ApiProperty({ example: 390 })
  successfulImports: number;

  @ApiProperty({ example: 2 })
  failedImports: number;

  @ApiProperty({ example: ['Row 15: Invalid hospital name', 'Row 23: Missing required field'] })
  errors: string[];

  @ApiProperty({ example: 'Import completed. 390 records processed successfully, 2 failed.' })
  message: string;
}

