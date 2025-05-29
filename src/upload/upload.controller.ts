import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Res, UseGuards, Body, Delete, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { Module } from './upload.entity';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        module: {
          type: 'string',
          enum: ['ACTIVITY', 'MEMO', 'KNOWLEDGE_BASE', 'PLAN', 'DOCUMENT', 'OTHER'],
        },
      },
    },
  })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Body() body: { module: Module }): Promise<string[]> {
    console.log(body);
    return await this.uploadService.uploadFiles(files, body.module);
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = await this.uploadService.getFilePath(filename);
    return res.sendFile(filePath);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return await this.uploadService.deleteFile(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Return all files' })
  async listFiles() {
    try {
      return await this.uploadService.listFiles();
    } catch (error) {
      console.log('Error listing files:', error);
      throw new BadRequestException('Failed to list files');
    }
  }
} 