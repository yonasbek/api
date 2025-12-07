import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ContactType, ContactPosition } from '../enums/contact-type.enum';

@Entity('contacts')
export class Contact extends BaseEntity {
  @ApiProperty({ example: 'Federal Ministry of Health' })
  @Column()
  instituteName: string;

  @ApiProperty({ example: 'Dr. Yonas Bekele' })
  @Column()
  individualName: string;

  @ApiProperty({ enum: ContactPosition, example: ContactPosition.HEAD })
  @Column({
    type: 'enum',
    enum: ContactPosition,
    default: ContactPosition.OTHER,
  })
  position: ContactPosition;

  @ApiProperty({ example: '+251911234567' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ example: 'yonas.bekele@moh.gov.et' })
  @Column()
  emailAddress: string;

  @ApiProperty({ enum: ContactType, example: ContactType.MOH_AGENCIES })
  @Column({
    type: 'enum',
    enum: ContactType,
  })
  organizationType: ContactType;

  @ApiProperty({ example: 'Addis Ababa', required: false })
  @Column({ nullable: true })
  region?: string;

  @ApiProperty({ example: 'Main office building, 3rd floor', required: false })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ example: 'Mon-Fri 8:00-17:00', required: false })
  @Column({ nullable: true })
  availableHours?: string;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: 'Additional notes about the contact',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ example: '+251922345678', required: false })
  @Column({ nullable: true })
  alternativePhone?: string;
}
