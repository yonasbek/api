import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TrainingType {
  WORKSHOP = 'workshop',
  EVENT = 'event',
  MENTORSHIP = 'mentorship',
  FIELD_TRIP = 'field_trip',
  OTHER = 'other'
}

export enum TrainingLocation {
  LOCAL = 'local',
  ABROAD = 'abroad'
}

@Entity('trainings')
export class Training extends BaseEntity {
  @ApiProperty({ example: 'Advanced Medical Training', description: 'Training title' })
  @Column()
  title: string;

  @ApiProperty({ example: 'workshop', enum: TrainingType, description: 'Type of training' })
  @Column({
    type: 'enum',
    enum: TrainingType,
    default: TrainingType.WORKSHOP
  })
  type: TrainingType;

  @ApiProperty({ example: 'local', enum: TrainingLocation, description: 'Training location type' })
  @Column({
    type: 'enum',
    enum: TrainingLocation,
    default: TrainingLocation.LOCAL
  })
  location_type: TrainingLocation;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia', description: 'Training location address' })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ example: 'United States', description: 'Country for abroad trainings' })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({ example: '2024-01-15', description: 'Training start date' })
  @Column('date')
  start_date: Date;

  @ApiProperty({ example: '2024-01-20', description: 'Training end date' })
  @Column('date')
  end_date: Date;

  @ApiProperty({ example: 'Dr. John Doe', description: 'Training organizer/instructor' })
  @Column({ nullable: true })
  organizer: string;

  @ApiProperty({ example: 'Comprehensive training on advanced medical procedures', description: 'Training description' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ example: ['trip_report.pdf', 'photos.zip'], description: 'Uploaded document file names' })
  @Column('simple-array', { nullable: true, default: [] })
  trip_report: string[];

  @ApiProperty({ example: ['photo1.jpg', 'photo2.jpg'], description: 'Uploaded photo file names' })
  @Column('simple-array', { nullable: true, default: [] })
  photos: string[];

  @ApiProperty({ example: ['attendance.pdf'], description: 'Uploaded attendance file names' })
  @Column('simple-array', { nullable: true, default: [] })
  attendance: string[];

  @ApiProperty({ example: ['letter.pdf'], description: 'Uploaded additional letter file names' })
  @Column('simple-array', { nullable: true, default: [] })
  additional_letter: string[];

  @ApiProperty({ example: 25, description: 'Number of participants' })
  @Column('int', { default: 0, nullable: true })
  participants_count: number;

  @ApiProperty({ example: 'Completed successfully', description: 'Training status or remarks' })
  @Column('text', { nullable: true })
  remarks: string;
}

