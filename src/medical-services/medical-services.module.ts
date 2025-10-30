import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalServicesService } from './medical-services.service';
import { MedicalServicesController } from './medical-services.controller';
import { MedicalService } from './entities/medical-service.entity';
import { RegionalAmbulanceService } from './entities/regional-ambulance-service.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([MedicalService, RegionalAmbulanceService])
    ],
    controllers: [MedicalServicesController],
    providers: [MedicalServicesService],
    exports: [MedicalServicesService],
})
export class MedicalServicesModule { }

