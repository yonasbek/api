import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportReport } from './entities/import-report.entity';
import { ImportCsvDto } from './dto/import-csv.dto';
import { ImportResponseDto } from './dto/import-response.dto';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportReport)
    private readonly importReportRepository: Repository<ImportReport>,
  ) {}

  async importCsv(
    file: Express.Multer.File,
    importDto: ImportCsvDto,
  ): Promise<ImportResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const isCSV =
      file.mimetype.includes('csv') || file.originalname.endsWith('.csv');
    const isXLSX =
      file.mimetype.includes('spreadsheetml') ||
      file.mimetype.includes('excel') ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      throw new BadRequestException('File must be a CSV or XLSX file');
    }

    try {
      const results: any[] = [];
      let headers: string[] = [];

      if (isXLSX) {
        // Parse XLSX file
        console.log('Parsing XLSX file...');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Use first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header option
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          throw new Error('No data found in XLSX file');
        }

        // Find header row (usually second row based on your data)
        let headerRowIndex = 1; // Default to second row
        let expectedColumns = 0;

        console.log('XLSX Raw data preview:', jsonData.slice(0, 5));

        // Check first few rows to find headers
        for (let i = 1; i < Math.min(4, jsonData.length); i++) {
          const row = jsonData[i] as any[];
          console.log(`XLSX Checking row ${i} for headers:`, row);
          if (this.isHeaderRow(row)) {
            headerRowIndex = i;
            expectedColumns = row.length;
            console.log(`XLSX Found header row at index ${i}`);
            break;
          }
        }

        // If no header found, try different positions
        if (expectedColumns === 0 && jsonData.length > 1) {
          // Try row 1 first (second row)
          if (jsonData[1] && (jsonData[1] as any[]).length > 0) {
            headerRowIndex = 1;
            expectedColumns = (jsonData[1] as any[]).length;
            console.log('XLSX Using default header row (index 1)');
          }
          // If row 1 is empty, try row 0 (first row)
          else if (jsonData[0] && (jsonData[0] as any[]).length > 0) {
            headerRowIndex = 0;
            expectedColumns = (jsonData[0] as any[]).length;
            console.log('XLSX Using first row as header (index 0)');
          }
        }

        console.log('XLSX Header row found at index:', headerRowIndex);
        console.log('XLSX Expected columns:', expectedColumns);

        // Get headers
        headers = (jsonData[headerRowIndex] as any[]).map((header: any) =>
          String(header || ''),
        );
        console.log('XLSX Headers detected:', headers);

        // Parse data rows
        console.log('XLSX Total rows in file:', jsonData.length);
        console.log('XLSX Starting data parsing from row:', headerRowIndex + 1);

        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          console.log(`XLSX Row ${i}:`, row);
          console.log(
            `XLSX Row ${i} length:`,
            row.length,
            'Expected:',
            expectedColumns,
          );

          if (row && row.length > 0) {
            // Create row data even if column count doesn't match exactly
            const rowData: any = {};
            headers.forEach((header, index) => {
              rowData[header] = String(row[index] || '');
            });
            results.push(rowData);
            console.log(`XLSX Added row ${i}:`, rowData);
          } else {
            console.log(`XLSX Skipping empty row ${i}`);
          }
        }
        console.log('XLSX parsing completed. Total rows:', results.length);
      } else {
        // Parse CSV file
        console.log('Parsing CSV file...');
        const csvContent = file.buffer.toString('utf8');
        console.log('CSV Content preview:', csvContent.substring(0, 500));

        // Use intelligent CSV parsing that handles unquoted commas
        const lines = csvContent.split('\n').filter((line) => line.trim());
        if (lines.length === 0) {
          throw new Error('No data found in CSV file');
        }

        // Find the header row by looking for common header patterns
        // Start from the second row (index 1) since the user mentioned header is in the second row
        let headerRowIndex = 1; // Default to second row
        let expectedColumns = 0;

        // Check the first few rows to find the header
        for (let i = 1; i < Math.min(4, lines.length); i++) {
          const line = lines[i];
          const potentialHeaders = this.parseCSVLine(line);

          // Check if this looks like a header row
          if (this.isHeaderRow(potentialHeaders)) {
            headerRowIndex = i;
            expectedColumns = potentialHeaders.length;
            break;
          }
        }

        // If no header found in first few rows, use the second row as default
        if (expectedColumns === 0 && lines.length > 1) {
          headerRowIndex = 1;
          const headerLine = lines[1];
          expectedColumns = this.countColumnsFromHeader(headerLine);
        }

        console.log('CSV Header row found at index:', headerRowIndex);
        console.log('CSV Expected columns:', expectedColumns);

        // Parse headers from the identified header row
        const headerLine = lines[headerRowIndex];
        console.log('CSV Header line raw:', headerLine);
        headers = this.parseCSVLineWithColumnCount(headerLine, expectedColumns);
        console.log('CSV Headers detected:', headers);
        console.log('CSV Number of headers:', headers.length);

        // Parse data rows starting after the header row
        for (let i = headerRowIndex + 1; i < lines.length; i++) {
          const values = this.parseCSVLineWithColumnCount(
            lines[i],
            expectedColumns,
          );
          if (values.length === expectedColumns) {
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            results.push(row);
          } else {
            console.log(
              `Skipping row ${i + 1}: expected ${expectedColumns} columns, got ${values.length}`,
            );
          }
        }
        console.log('CSV parsing completed. Total rows:', results.length);
      }

      // Create import report
      const importReport = this.importReportRepository.create({
        name: importDto.name,
        filename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        totalRows: results.length,
        totalColumns: headers.length,
        headers: JSON.stringify(headers),
        data: JSON.stringify(results),
        status: 'SUCCESS',
        message: `Successfully imported ${results.length} rows with ${headers.length} columns`,
      });

      const savedReport = await this.importReportRepository.save(importReport);

      return {
        id: savedReport.id,
        name: savedReport.name,
        filename: savedReport.filename,
        totalRows: savedReport.totalRows,
        totalColumns: savedReport.totalColumns,
        headers: JSON.parse(savedReport.headers),
        status: savedReport.status,
        createdAt: savedReport.created_at,
      };
    } catch (error) {
      // Save failed import report
      const failedReport = this.importReportRepository.create({
        name: importDto.name,
        filename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        totalRows: 0,
        totalColumns: 0,
        headers: JSON.stringify([]),
        data: JSON.stringify([]),
        status: 'FAILED',
        message: `Import failed: ${error.message}`,
      });

      await this.importReportRepository.save(failedReport);
      throw new BadRequestException(`Failed to import CSV: ${error.message}`);
    }
  }

  async getAllImportReports(): Promise<ImportResponseDto[]> {
    const reports = await this.importReportRepository.find({
      order: { created_at: 'DESC' },
    });

    return reports.map((report) => ({
      id: report.id,
      name: report.name,
      filename: report.filename,
      totalRows: report.totalRows,
      totalColumns: report.totalColumns,
      headers: JSON.parse(report.headers),
      status: report.status,
      createdAt: report.created_at,
    }));
  }

  async getImportReportById(id: string): Promise<ImportReport> {
    const report = await this.importReportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new BadRequestException('Import report not found');
    }

    return report;
  }

  async deleteImportReport(id: string): Promise<void> {
    const result = await this.importReportRepository.delete(id);

    if (result.affected === 0) {
      throw new BadRequestException('Import report not found');
    }
  }

  private isHeaderRow(potentialHeaders: any[]): boolean {
    // Check if this row looks like headers by looking for common header patterns
    const headerKeywords = [
      'no',
      'indicator',
      'description',
      'program',
      'data source',
      'value type',
      'visualization',
      'disaggregation',
      'data update',
      'period for',
      'alerts',
      'legend',
      'name',
      'id',
      'type',
      'category',
      'status',
      'date',
      'time',
    ];

    // Convert all fields to strings and check
    const stringFields = potentialHeaders.map((field) =>
      String(field || '')
        .toLowerCase()
        .trim(),
    );

    // Count how many fields look like headers
    let headerCount = 0;
    for (const field of stringFields) {
      if (field && headerKeywords.some((keyword) => field.includes(keyword))) {
        headerCount++;
      }
    }

    // If more than half the fields look like headers, consider this a header row
    const threshold = Math.max(1, potentialHeaders.length / 2);
    return headerCount >= threshold;
  }

  private countColumnsFromHeader(headerLine: string): number {
    // Count commas in the header line to determine expected columns
    // This assumes the header doesn't have commas within field names
    const commaCount = (headerLine.match(/,/g) || []).length;
    return commaCount + 1; // +1 because columns = commas + 1
  }

  private parseCSVLineWithColumnCount(
    line: string,
    expectedColumns: number,
  ): string[] {
    // Use the fixed columns approach for better handling of unquoted commas
    return this.parseCSVLineWithFixedColumns(line, expectedColumns);
  }

  private parseCSVLineIntelligent(
    line: string,
    expectedColumns: number,
  ): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let fieldCount = 0;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        fieldCount++;

        // If we've reached the expected number of columns, treat the rest as one field
        if (fieldCount >= expectedColumns - 1) {
          // Collect everything after this comma as the last field
          current = line.substring(i + 1);
          break;
        }
      } else {
        current += char;
      }
    }

    // Add the last field (or remaining content)
    result.push(current.trim());

    // Ensure we have exactly the expected number of columns
    while (result.length < expectedColumns) {
      result.push('');
    }

    return result.slice(0, expectedColumns);
  }

  private parseCSVLineWithFixedColumns(
    line: string,
    expectedColumns: number,
  ): string[] {
    // Split by comma and then recombine to get the right number of columns
    const parts = line.split(',');

    if (parts.length === expectedColumns) {
      return parts.map((part) => part.trim());
    }

    if (parts.length > expectedColumns) {
      // Too many parts - need to recombine
      const result: string[] = [];

      // Take the first expectedColumns - 1 parts as individual fields
      for (let i = 0; i < expectedColumns - 1; i++) {
        result.push(parts[i].trim());
      }

      // Combine all remaining parts into the last field
      const lastField = parts
        .slice(expectedColumns - 1)
        .join(',')
        .trim();
      result.push(lastField);

      return result;
    }

    // Too few parts - pad with empty strings
    while (parts.length < expectedColumns) {
      parts.push('');
    }

    return parts.map((part) => part.trim());
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current.trim());

    return result;
  }
}
