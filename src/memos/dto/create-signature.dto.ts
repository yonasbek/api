import { IsString, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SignatureAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class CreateSignatureDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  signerId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  signerName: string;

  @ApiProperty({ enum: SignatureAction, example: SignatureAction.APPROVE })
  @IsEnum(SignatureAction)
  @IsNotEmpty()
  action: SignatureAction;

  @ApiProperty({ example: 'Approved with minor changes' })
  @IsString()
  @IsNotEmpty()
  comments: string;

  // This will be set by the controller
  memoId?: string;
}
