import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Res, UseGuards, Body, Delete, BadRequestException, Query } from '@nestjs/common';
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
        requires_approval: {
          type: 'any',
        },
      },
    },
  })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Body() body: { module: Module, requires_approval?: any }): Promise<string[]> {
    console.log(body.requires_approval, 'requires_approval');
    const requiresApproval = body.requires_approval == true || body.requires_approval == 'true'? true : false;
    return await this.uploadService.uploadFiles(files, body.module, requiresApproval);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Return all files' })
  async listFiles(@Query('status') status?: string) {
    try {
      return await this.uploadService.listFiles(status);
    } catch (error) {
      console.log('Error listing files:', error);
      throw new BadRequestException('Failed to list files');
    }
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending files requiring approval' })
  @ApiResponse({ status: 200, description: 'Return all pending files' })
  async listPendingFiles() {
    try {
      return await this.uploadService.listPendingFiles();
    } catch (error) {
      console.log('Error listing pending files:', error);
      throw new BadRequestException('Failed to list pending files');
    }
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

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a pending file' })
  @ApiResponse({ status: 200, description: 'File approved successfully' })
  async approveFile(@Param('id') id: string) {
    try {
      return await this.uploadService.approveFile(id);
    } catch (error) {
      console.log('Error approving file:', error);
      throw new BadRequestException('Failed to approve file');
    }
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a pending file' })
  @ApiResponse({ status: 200, description: 'File rejected successfully' })
  async rejectFile(@Param('id') id: string) {
    try {
      return await this.uploadService.rejectFile(id);
    } catch (error) {
      console.log('Error rejecting file:', error);
      throw new BadRequestException('Failed to reject file');
    }
  }
} 