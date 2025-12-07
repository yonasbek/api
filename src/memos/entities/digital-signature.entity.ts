import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Memo } from './memo.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('digital_signatures')
export class DigitalSignature extends BaseEntity {
  @ManyToOne(() => Memo, (memo) => memo.signatures)
  memo: Memo;

  @ApiProperty({ example: 'user-123' })
  @Column()
  user_id: string;

  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  @Column('timestamp')
  signed_at: Date;

  @ApiProperty({ example: 'APPROVED' })
  @Column()
  status: string;

  @ApiProperty({ example: 'Approved with minor changes' })
  @Column('text', { nullable: true })
  comments: string;
}
