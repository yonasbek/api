import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { createWriteStream, unlink } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import type { Multer } from 'multer';

const unlinkAsync = promisify(unlink);

@Injectable()
export class DocumentsService {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'documents');

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(this.uploadPath, fileName);

    // Save file to disk
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (error) => reject(error));
    });

    // Create document record
    const document = this.documentRepository.create({
      ...createDocumentDto,
      fileName: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    });

    return await this.documentRepository.save(document);
  }

  async findAll(category?: string): Promise<Document[]> {
    const where = category ? { category } : {};
    return await this.documentRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async search(query: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: [
        { title: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
        { category: Like(`%${query}%`) },
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async download(
    id: string,
  ): Promise<{ path: string; originalName: string; mimeType: string }> {
    const document = await this.findOne(id);
    return {
      path: document.path,
      originalName: document.fileName,
      mimeType: document.mimeType,
    };
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return await this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);

    // Delete file from disk
    try {
      await unlinkAsync(document.path);
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
    }

    const result = await this.documentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }
}
