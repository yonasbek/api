import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WorkflowAction {
  SUBMIT_TO_DESK_HEAD = 'SUBMIT_TO_DESK_HEAD',
  SUBMIT_TO_LEO = 'SUBMIT_TO_LEO',
  APPROVE = 'APPROVE',
  RETURN_TO_CREATOR = 'RETURN_TO_CREATOR',
  REJECT = 'REJECT',
}

export class WorkflowActionDto {
  @ApiProperty({ enum: WorkflowAction, example: WorkflowAction.SUBMIT_TO_LEO })
  @IsEnum(WorkflowAction)
  @IsNotEmpty()
  action: WorkflowAction;

  @ApiProperty({
    example: 'This memo looks good, forwarding to LEO for final approval',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ example: 'user-id-123' })
  @IsString()
  @IsOptional()
  reviewerId?: string;
}

export class GenerateDocumentDto {
  @ApiProperty({ example: 'memo-id-123' })
  @IsString()
  @IsNotEmpty()
  memoId: string;
}
