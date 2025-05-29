import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';
import { Indicator } from './entities/indicator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Indicator]),
  ],
  controllers: [IndicatorsController],
  providers: [IndicatorsService],
  exports: [IndicatorsService],
}) 
export class IndicatorsModule {}