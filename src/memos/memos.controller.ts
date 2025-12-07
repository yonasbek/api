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
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MemosService } from './memos.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { WorkflowActionDto } from './dto/workflow-action.dto';
import { Memo } from './entities/memo.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Memos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('memos')
export class MemosController {
  constructor(private readonly memosService: MemosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new memo' })
  @ApiResponse({
    status: 201,
    description: 'Memo created successfully',
    type: Memo,
  })
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
  @ApiResponse({
    status: 200,
    description: 'Memo updated successfully',
    type: Memo,
  })
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
  @ApiResponse({
    status: 200,
    description: 'Attachments uploaded successfully',
    type: Memo,
  })
  async uploadAttachments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Memo> {
    return await this.memosService.addAttachments(id, files);
  }

  @Delete(':id/attachments/:filename')
  @ApiOperation({ summary: 'Remove an attachment from a memo' })
  @ApiResponse({
    status: 200,
    description: 'Attachment removed successfully',
    type: Memo,
  })
  async removeAttachment(
    @Param('id') id: string,
    @Param('filename') filename: string,
  ): Promise<Memo> {
    return await this.memosService.removeAttachment(id, filename);
  }

  @Post(':id/workflow/submit-to-desk-head')
  @ApiOperation({ summary: 'Submit memo to desk head for review' })
  @ApiResponse({
    status: 200,
    description: 'Memo submitted to desk head successfully',
    type: Memo,
  })
  async submitToDeskHead(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Memo> {
    return await this.memosService.submitToDeskHead(id, user.id);
  }

  @Post(':id/workflow/desk-head-action')
  @ApiOperation({ summary: 'Desk head performs workflow action on memo' })
  @ApiResponse({
    status: 200,
    description: 'Desk head action performed successfully',
    type: Memo,
  })
  async deskHeadAction(
    @Param('id') id: string,
    @Body() workflowActionDto: WorkflowActionDto,
    @GetUser() user: User,
  ): Promise<Memo> {
    return await this.memosService.deskHeadAction(
      id,
      workflowActionDto,
      user.id,
    );
  }

  @Post(':id/workflow/leo-action')
  @ApiOperation({ summary: 'LEO performs workflow action on memo' })
  @ApiResponse({
    status: 200,
    description: 'LEO action performed successfully',
    type: Memo,
  })
  async leoAction(
    @Param('id') id: string,
    @Body() workflowActionDto: WorkflowActionDto,
    @GetUser() user: User,
  ): Promise<Memo> {
    return await this.memosService.leoAction(id, workflowActionDto, user.id);
  }

  @Get(':id/workflow/history')
  @ApiOperation({ summary: 'Get workflow history for a memo' })
  @ApiResponse({ status: 200, description: 'Return workflow history' })
  async getWorkflowHistory(@Param('id') id: string): Promise<any> {
    return await this.memosService.getWorkflowHistory(id);
  }

  @Get(':id/document')
  @ApiOperation({ summary: 'Generate document data for approved memo' })
  @ApiResponse({ status: 200, description: 'Return document data' })
  async generateDocument(@Param('id') id: string): Promise<any> {
    return await this.memosService.generateDocument(id);
  }

  @Get(':id/document/html')
  @ApiOperation({ summary: 'Generate HTML document for printing' })
  @ApiResponse({
    status: 200,
    description: 'Return HTML document for printing',
  })
  async generateHTMLDocument(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const htmlContent = await this.memosService.generateHTMLDocument(id);
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }

  @Get('pending/desk-head')
  @ApiOperation({ summary: 'Get memos pending desk head review' })
  @ApiResponse({
    status: 200,
    description: 'Return memos pending desk head review',
    type: [Memo],
  })
  async getMemosPendingDeskHead(): Promise<Memo[]> {
    return await this.memosService.getMemosPendingDeskHead();
  }

  @Get('pending/leo')
  @ApiOperation({ summary: 'Get memos pending LEO review' })
  @ApiResponse({
    status: 200,
    description: 'Return memos pending LEO review',
    type: [Memo],
  })
  async getMemosPendingLEO(): Promise<Memo[]> {
    return await this.memosService.getMemosPendingLEO();
  }
}
