import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Module, Uploads } from './upload.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads';

  constructor(
    @InjectRepository(Uploads)
    private readonly uploadRepository: Repository<Uploads>,
  ) {
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFiles(files: Express.Multer.File[], module: Module, requiresApproval: boolean = false): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    console.log(requiresApproval == true, 'requiresApproval');


    const savedFiles: string[] = [];

    for (const file of files) {


      const fileExt = file.originalname;
      const fileName = `${uuidv4()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, fileName);
      console.log(`Saving file to ${filePath}`, file.originalname, file.mimetype, file.buffer);
      try {
        await fs.writeFile(filePath, file.buffer);
        const upload = new Uploads();
        upload.document_name = file.originalname;
        upload.document_url = filePath;
        upload.document_type = file.mimetype;
        upload.document_size = file.size;
        upload.upload_date = new Date();
        upload.module = module;
        upload.requires_approval = requiresApproval;
        upload.status = requiresApproval ? 'pending' : 'published';
        await this.uploadRepository.save(upload);
        savedFiles.push(fileName);
      } catch (error) {
        console.log(`Failed to save file ${file.originalname}:`, error);
        throw new BadRequestException(`Failed to save file ${file.originalname}`);
      }
    }

    return savedFiles;
  }

  async deleteFiles(fileNames: string[]): Promise<void> {
    for (const fileName of fileNames) {
      const filePath = path.join(this.uploadDir, fileName);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Log error but continue with other deletions
        console.error(`Failed to delete file ${fileName}:`, error);
      }
    }
  }

  async getFilePath(fileName: string): Promise<string> {
    const filePath = path.join('http://localhost:3000/',this.uploadDir, fileName);
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      throw new BadRequestException(`File ${fileName} not found`);
    }
  }

  async listFiles(status?: string): Promise<Uploads[]> {
    try {
      console.log('Listing files');
      const where = status ? { status } : {};
      return await this.uploadRepository.find({
        where,
        order: { upload_date: 'DESC' }
      });
    } catch (error) {
      console.log('Error listing files:', error);
      throw new BadRequestException('Failed to list files');
    }
  }

  async deleteFile(id: string): Promise<void> {
    await this.uploadRepository.delete(id);
  }

  async listPendingFiles(): Promise<Uploads[]> {
    try {
      return await this.uploadRepository.find({
        where: { status: 'pending', requires_approval: true },
        order: { upload_date: 'DESC' }
      });
    } catch (error) {
      console.log('Error listing pending files:', error);
      throw new BadRequestException('Failed to list pending files');
    }
  }

  async approveFile(id: string): Promise<Uploads> {
    const file = await this.uploadRepository.findOne({ where: { id } });
    if (!file) {
      throw new BadRequestException('File not found');
    }
    file.status = 'published';
    file.requires_approval = false;
    return await this.uploadRepository.save(file);
  }

  async rejectFile(id: string): Promise<Uploads> {
    const file = await this.uploadRepository.findOne({ where: { id } });
    if (!file) {
      throw new BadRequestException('File not found');
    }
    file.status = 'rejected';
    return await this.uploadRepository.save(file);
  }
} 