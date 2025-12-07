import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportService } from './import.service';
import { ImportCsvDto } from './dto/import-csv.dto';
import { ImportResponseDto } from './dto/import-response.dto';

@ApiTags('Import')
@Controller('import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import CSV file and parse data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
          example: 'Employee Data Import',
        },
        description: {
          type: 'string',
          example: 'Employee data import for Q1 2024',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'CSV file imported successfully',
    type: ImportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or data',
  })
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() importDto: ImportCsvDto,
  ): Promise<ImportResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return await this.importService.importCsv(file, importDto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all import reports' })
  @ApiResponse({
    status: 200,
    description: 'List of all import reports',
    type: [ImportResponseDto],
  })
  async getAllImportReports(): Promise<ImportResponseDto[]> {
    return await this.importService.getAllImportReports();
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get import report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Import report details',
  })
  @ApiResponse({
    status: 404,
    description: 'Import report not found',
  })
  async getImportReportById(@Param('id') id: string) {
    const report = await this.importService.getImportReportById(id);
    return {
      ...report,
      headers: JSON.parse(report.headers),
      data: JSON.parse(report.data),
    };
  }

  @Delete('reports/:id')
  @ApiOperation({ summary: 'Delete import report' })
  @ApiResponse({
    status: 200,
    description: 'Import report deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Import report not found',
  })
  async deleteImportReport(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.importService.deleteImportReport(id);
    return { message: 'Import report deleted successfully' };
  }
}
