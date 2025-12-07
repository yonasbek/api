import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { ActivitiesModule } from './activities/activities.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { ContactsModule } from './contacts/contacts.module';
import { MemosModule } from './memos/memos.module';
import { AttendanceModule } from './attendance/attendance.module';
import { RoomsModule } from './rooms/rooms.module';
import { RemindersModule } from './reminders/reminders.module';
import { DocumentsModule } from './documents/documents.module';
import { typeOrmConfig } from './config/typeorm.config';
import { PlansModule } from './plans/plans.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TrainingModule } from './training/training.module';
import { ImportModule } from './import/import.module';
import { AdHocTasksModule } from './adhoc-tasks/adhoc-tasks.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    KnowledgeModule,
    ActivitiesModule,
    IndicatorsModule,
    ContactsModule,
    MemosModule,
    AttendanceModule,
    RoomsModule,
    RemindersModule,
    DocumentsModule,
    PlansModule,
    UploadModule,
    UsersModule,
    ReportsModule,
    TrainingModule,
    ImportModule,
    AdHocTasksModule,
  ],
})
export class AppModule {}
