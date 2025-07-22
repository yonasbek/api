import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemosController } from './memos.controller';
import { MemosService } from './memos.service';
import { DocumentGenerationService } from './document-generation.service';
import { Memo } from './entities/memo.entity';
import { MemoSignature } from './entities/memo-signature.entity';
import { User } from '../users/entities/user.entity';
import { UploadService } from '../upload/upload.service';
import { Uploads } from '../upload/upload.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Memo, MemoSignature, User, Uploads])],
  controllers: [MemosController],
  providers: [MemosService, UploadService, DocumentGenerationService],
  exports: [MemosService],
})
export class MemosModule {} 