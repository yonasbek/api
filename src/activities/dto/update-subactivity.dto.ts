import { PartialType } from '@nestjs/swagger';
import { CreateSubActivityDto } from './create-subactivity.dto';

export class UpdateSubActivityDto extends PartialType(CreateSubActivityDto) {}
