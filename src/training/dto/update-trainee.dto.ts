import { PartialType } from '@nestjs/swagger';
import { CreateTraineeDto } from './create-trainee.dto';

export class UpdateTraineeDto extends PartialType(CreateTraineeDto) {}