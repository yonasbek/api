import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('import_reports')
export class ImportReport extends BaseEntity {
  @ApiProperty({ example: 'Employee Data Import' })
  @Column()
  name: string;

  @ApiProperty({ example: 'employee_data.csv' })
  @Column()
  filename: string;

  @ApiProperty({ example: 'application/csv' })
  @Column()
  mimeType: string;

  @ApiProperty({ example: 1024 })
  @Column()
  fileSize: number;

  @ApiProperty({ example: 150 })
  @Column()
  totalRows: number;

  @ApiProperty({ example: 5 })
  @Column()
  totalColumns: number;

  @ApiProperty({
    example: '["name", "email", "department", "salary", "hire_date"]',
  })
  @Column('text')
  headers: string;

  @ApiProperty({
    example: '[{"name":"John Doe","email":"john@example.com",...}]',
  })
  @Column('text')
  data: string;

  @ApiProperty({ example: 'SUCCESS' })
  @Column({ default: 'SUCCESS' })
  status: string;

  @ApiProperty({ example: 'Import completed successfully' })
  @Column({ nullable: true })
  message: string;
}
