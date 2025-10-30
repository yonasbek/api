import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Tag])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {} 