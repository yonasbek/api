import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Uploads } from './upload.entity';
@Module({
  imports: [
    MulterModule.register({
      storage: undefined, // This will use memory storage by default
    }),
    TypeOrmModule.forFeature([Uploads]),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
