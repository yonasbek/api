import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  ParseBoolPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ContactsService, ContactSearchParams } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateContactSuggestionDto } from './dto/create-contact-suggestion.dto';
import { ReviewContactSuggestionDto } from './dto/review-contact-suggestion.dto';
import { ContactType, ContactPosition } from './enums/contact-type.enum';
import { SuggestionStatus } from './entities/contact-suggestion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('MSLEO Contact Directory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // === CONTACT MANAGEMENT (Admin Only) ===

  @Post()
  @ApiOperation({ summary: 'Create a new contact (Admin only)' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async create(@Body() createContactDto: CreateContactDto) {
    return await this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get contacts with advanced filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return filtered contacts with pagination',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for institution, individual, email, or phone',
  })
  @ApiQuery({
    name: 'organizationType',
    required: false,
    enum: ContactType,
    description: 'Filter by organization type',
  })
  @ApiQuery({
    name: 'position',
    required: false,
    enum: ContactPosition,
    description: 'Filter by position',
  })
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'Filter by region',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['instituteName', 'individualName', 'organizationType', 'created_at'],
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50)',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('organizationType') organizationType?: ContactType,
    @Query('position') position?: ContactPosition,
    @Query('region') region?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
    @Query('sortBy')
    sortBy?:
      | 'instituteName'
      | 'individualName'
      | 'organizationType'
      | 'created_at',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const params: ContactSearchParams = {
      search,
      organizationType,
      position,
      region,
      isActive,
      sortBy,
      sortOrder,
      page,
      limit,
    };
    return await this.contactsService.findAll(params);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get contact directory statistics' })
  @ApiResponse({ status: 200, description: 'Return contact statistics' })
  async getStats() {
    return await this.contactsService.getStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Simple search across all contact fields' })
  @ApiResponse({ status: 200, description: 'Return matching contacts' })
  async search(@Query('query') query: string) {
    return await this.contactsService.search(query);
  }

  @Get('autocomplete')
  @ApiOperation({
    summary: 'Get autocomplete suggestions for institution names and regions',
  })
  @ApiResponse({ status: 200, description: 'Return autocomplete suggestions' })
  async getAutocomplete(@Query('q') query: string = '') {
    return await this.contactsService.getAutocompleteData(query);
  }

  @Get('by-organization/:organizationType')
  @ApiOperation({ summary: 'Get contacts by organization type' })
  @ApiResponse({
    status: 200,
    description: 'Return contacts of specified organization type',
  })
  async findByOrganizationType(
    @Param('organizationType') organizationType: ContactType,
  ) {
    return await this.contactsService.findByOrganizationType(organizationType);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active contacts' })
  @ApiResponse({ status: 200, description: 'Return all active contacts' })
  async getActiveContacts() {
    return await this.contactsService.getActiveContacts();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export contacts (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return contacts for export' })
  async exportContacts(
    @Query('organizationType') organizationType?: ContactType,
  ) {
    return await this.contactsService.exportContacts(organizationType);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import contacts (Admin only)' })
  @ApiResponse({ status: 200, description: 'Import results' })
  async bulkImport(@Body() contacts: CreateContactDto[]) {
    return await this.contactsService.bulkImport(contacts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by id' })
  @ApiResponse({ status: 200, description: 'Return a contact' })
  async findOne(@Param('id') id: string) {
    return await this.contactsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return await this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  async remove(@Param('id') id: string) {
    return await this.contactsService.remove(id);
  }

  // === CONTACT SUGGESTIONS (All Users) ===

  @Post('suggestions')
  @ApiOperation({
    summary: 'Submit a suggestion for contact update/add/delete',
  })
  @ApiResponse({
    status: 201,
    description: 'Suggestion submitted successfully',
  })
  async createSuggestion(
    @Body() createSuggestionDto: CreateContactSuggestionDto,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;
      return await this.contactsService.createSuggestion(
        createSuggestionDto,
        userId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('suggestions/all')
  @ApiOperation({ summary: 'Get all contact suggestions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all suggestions' })
  async getAllSuggestions(@Query('status') status?: SuggestionStatus) {
    return await this.contactsService.findAllSuggestions(status);
  }

  @Get('suggestions/my')
  @ApiOperation({ summary: 'Get my contact suggestions' })
  @ApiResponse({ status: 200, description: "Return user's suggestions" })
  async getMySuggestions(@Request() req) {
    const userId = req.user.id;
    return await this.contactsService.findSuggestionsByUser(userId);
  }

  @Patch('suggestions/:id/review')
  @ApiOperation({ summary: 'Review a contact suggestion (Admin only)' })
  @ApiResponse({ status: 200, description: 'Suggestion reviewed successfully' })
  async reviewSuggestion(
    @Param('id') suggestionId: string,
    @Body() reviewDto: ReviewContactSuggestionDto,
    @Request() req,
  ) {
    const reviewerId = req.user.id;
    return await this.contactsService.reviewSuggestion(
      suggestionId,
      reviewDto,
      reviewerId,
    );
  }
}
