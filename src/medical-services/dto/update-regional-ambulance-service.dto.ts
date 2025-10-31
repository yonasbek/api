import { PartialType } from '@nestjs/swagger';
import { CreateRegionalAmbulanceServiceDto } from './create-regional-ambulance-service.dto';

export class UpdateRegionalAmbulanceServiceDto extends PartialType(CreateRegionalAmbulanceServiceDto) { }

