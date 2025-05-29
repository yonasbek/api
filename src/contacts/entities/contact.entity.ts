import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('contacts')
export class Contact extends BaseEntity {
  @ApiProperty({ example: 'Yonas Bekele' })
  @Column()
  fullName: string;

  @ApiProperty({ example: 'Software developer' })
  @Column()
  jobTitle: string;

  @ApiProperty({ example: 'external' })
  @Column()
  department: string;

  @ApiProperty({ example: '+251923273069' })
  @Column()
  officePhone: string;

  @ApiProperty({ example: '+251923273069', required: false })
  @Column({ nullable: true })
  mobileNumber?: string;

  @ApiProperty({ example: 'yonasbek4@gmail.com' })
  @Column()
  emailAddress: string;

  @ApiProperty({ example: 'Addis Ababa, ETH', required: false })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ example: '2025-05-29T07:47', required: false })
  @Column({ nullable: true })
  availableHour?: string;

  @ApiProperty({ example: 'desc', required: false })
  @Column({ nullable: true })
  availableHourDesc?: string;

  @ApiProperty({ example: 'partner' })
  @Column()
  category: string;
}