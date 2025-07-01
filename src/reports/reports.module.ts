import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { Booking } from '../rooms/entities/booking.entity';
import { Memo } from '../memos/entities/memo.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room, Booking, Memo, Document])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {} 