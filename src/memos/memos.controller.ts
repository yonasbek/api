import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MemosService } from './memos.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { Memo } from './entities/memo.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Memos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('memos')
export class MemosController {
  constructor(private readonly memosService: MemosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new memo' })
  @ApiResponse({ status: 201, description: 'Memo created successfully', type: Memo })
  async create(@Body() createMemoDto: CreateMemoDto): Promise<Memo> {
    return await this.memosService.create(createMemoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all memos' })
  @ApiResponse({ status: 200, description: 'Return all memos', type: [Memo] })
  async findAll(
    @Query('department') department?: string,
    @Query('recipient') recipientId?: string,
  ): Promise<Memo[]> {
    if (department) {
      return await this.memosService.findByDepartment(department);
    }
    if (recipientId) {
      return await this.memosService.findByRecipient(recipientId);
    }
    return await this.memosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a memo by id' })
  @ApiResponse({ status: 200, description: 'Return a memo', type: Memo })
  async findOne(@Param('id') id: string): Promise<Memo> {
    return await this.memosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a memo' })
  @ApiResponse({ status: 200, description: 'Memo updated successfully', type: Memo })
  async update(
    @Param('id') id: string,
    @Body() updateMemoDto: UpdateMemoDto,
  ): Promise<Memo> {
    return await this.memosService.update(id, updateMemoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a memo' })
  @ApiResponse({ status: 200, description: 'Memo deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.memosService.remove(id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload attachments for a memo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Attachments uploaded successfully', type: Memo })
  async uploadAttachments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<Memo> {
    return await this.memosService.addAttachments(id, files);
  }

  @Delete(':id/attachments/:filename')
  @ApiOperation({ summary: 'Remove an attachment from a memo' })
  @ApiResponse({ status: 200, description: 'Attachment removed successfully', type: Memo })
  async removeAttachment(
    @Param('id') id: string,
    @Param('filename') filename: string
  ): Promise<Memo> {
    return await this.memosService.removeAttachment(id, filename);
  }
} 