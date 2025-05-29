import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactType } from './enums/contact-type.enum';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contact Directory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async create(@Body() createContactDto: CreateContactDto) {
    return await this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 200, description: 'Return all contacts' })
  async findAll() {
    return await this.contactsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search contacts' })
  @ApiResponse({ status: 200, description: 'Return matching contacts' })
  async search(@Query('query') query: string) {
    return await this.contactsService.search(query);
  }


  @Get('type/:type')
  @ApiOperation({ summary: 'Get contacts by type' })
  @ApiResponse({ status: 200, description: 'Return contacts of specified type' })
  async findByType(@Param('type') type: ContactType) {
    return await this.contactsService.findByType(type);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by id' })
  @ApiResponse({ status: 200, description: 'Return a contact' })
  async findOne(@Param('id') id: string) {
    return await this.contactsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return await this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  async remove(@Param('id') id: string) {
    return await this.contactsService.remove(id);
  }
} 