import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Memo } from './memo.entity';
import { SignatureAction } from '../dto/create-signature.dto';
import { ApiProperty } from '@nestjs/swagger';

@Entity('memo_signatures')
export class MemoSignature extends BaseEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column('uuid')
  memo_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column('uuid')
  signer_id: string;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  signer_name: string;

  @ApiProperty({ enum: SignatureAction, example: SignatureAction.APPROVE })
  @Column({
    type: 'enum',
    enum: SignatureAction,
  })
  action: SignatureAction;

  @ApiProperty({ example: 'Approved with minor changes' })
  @Column('text')
  comments: string;

  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  @Column('timestamp with time zone')
  signed_at: Date;

  @ManyToOne(() => Memo, memo => memo.signatures)
  @JoinColumn({ name: 'memo_id' })
  memo: Memo;
} 