import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, ILike } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { ContactSuggestion, SuggestionStatus, SuggestionType } from './entities/contact-suggestion.entity';
import { User } from '../users/entities/user.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateContactSuggestionDto } from './dto/create-contact-suggestion.dto';
import { ReviewContactSuggestionDto } from './dto/review-contact-suggestion.dto';
import { ContactType, ContactPosition } from './enums/contact-type.enum';

export interface ContactSearchParams {
  search?: string;
  organizationType?: ContactType;
  position?: ContactPosition;
  region?: string;
  isActive?: boolean;
  sortBy?: 'instituteName' | 'individualName' | 'organizationType' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ContactStats {
  totalContacts: number;
  activeContacts: number;
  inactiveContacts: number;
  byOrganizationType: { [key in ContactType]: number };
  pendingSuggestions: number;
}

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactSuggestion)
    private readonly suggestionRepository: Repository<ContactSuggestion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  // === CONTACT MANAGEMENT ===

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAll(params: ContactSearchParams = {}): Promise<{ contacts: Contact[]; total: number }> {
    const {
      search,
      organizationType,
      position,
      region,
      isActive = true,
      sortBy = 'instituteName',
      sortOrder = 'ASC',
      page = 1,
      limit = 50
    } = params;

    const queryBuilder = this.contactRepository.createQueryBuilder('contact');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(contact.instituteName ILIKE :search OR contact.individualName ILIKE :search OR contact.emailAddress ILIKE :search OR contact.phoneNumber ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (organizationType) {
      queryBuilder.andWhere('contact.organizationType = :organizationType', { organizationType });
    }

    if (position) {
      queryBuilder.andWhere('contact.position = :position', { position });
    }

    if (region) {
      queryBuilder.andWhere('contact.region ILIKE :region', { region: `%${region}%` });
    }

    queryBuilder.andWhere('contact.isActive = :isActive', { isActive });

    // Apply sorting
    queryBuilder.orderBy(`contact.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { contacts: data, total };
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id);
    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
  }

  // === SEARCH AND FILTERING ===

  async search(query: string): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: [
        { instituteName: ILike(`%${query}%`) },
        { individualName: ILike(`%${query}%`) },
        { emailAddress: ILike(`%${query}%`) },
        { phoneNumber: ILike(`%${query}%`) }
      ],
      order: { instituteName: 'ASC' }
    });
  }

  async findByOrganizationType(organizationType: ContactType): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { organizationType, isActive: true },
      order: { instituteName: 'ASC' }
    });
  }

  async getActiveContacts(): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { isActive: true },
      order: { instituteName: 'ASC' }
    });
  }

  // === AUTOCOMPLETE SUGGESTIONS ===

  async getAutocompleteOptions(field: 'instituteName' | 'region', query: string): Promise<string[]> {
    const queryBuilder = this.contactRepository.createQueryBuilder('contact')
      .select(`DISTINCT contact.${field}`, field)
      .where(`contact.${field} ILIKE :query`, { query: `%${query}%` })
      .andWhere('contact.isActive = :isActive', { isActive: true })
      .orderBy(`contact.${field}`, 'ASC')
      .limit(10);

    const results = await queryBuilder.getRawMany();
    return results.map(result => result[field]).filter(Boolean);
  }

  async getAutocompleteData(query: string = ''): Promise<{ institutions: string[]; regions: string[] }> {
    const [institutions, regions] = await Promise.all([
      this.getAutocompleteOptions('instituteName', query),
      this.getAutocompleteOptions('region', query)
    ]);

    return { institutions, regions };
  }

  // === STATISTICS & DASHBOARD ===

  async getStats(): Promise<ContactStats> {
    const contacts = await this.contactRepository.find();
    const pendingSuggestions = await this.suggestionRepository.count({
      where: { status: SuggestionStatus.PENDING }
    });

    const stats: ContactStats = {
      totalContacts: contacts.length,
      activeContacts: contacts.filter(c => c.isActive).length,
      inactiveContacts: contacts.filter(c => !c.isActive).length,
      byOrganizationType: {
        [ContactType.MOH_AGENCIES]: 0,
        [ContactType.REGIONAL_HEALTH_BUREAU]: 0,
        [ContactType.FEDERAL_HOSPITALS]: 0,
        [ContactType.ADDIS_ABABA_HOSPITALS]: 0,
        [ContactType.UNIVERSITY_HOSPITALS]: 0,
        [ContactType.ASSOCIATIONS]: 0,
        [ContactType.PARTNERS]: 0
      },
      pendingSuggestions
    };

    // Count by categories
    contacts.forEach(contact => {
      if (contact.isActive) {
        stats.byOrganizationType[contact.organizationType]++;
      }
    });

    return stats;
  }

  // === CONTACT SUGGESTIONS ===

  async createSuggestion(
    createSuggestionDto: CreateContactSuggestionDto,
    userId: string
  ): Promise<ContactSuggestion> {
    // Verify user exists
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.log('user not found');
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // If it's an update suggestion, verify contact exists
      if (createSuggestionDto.contact_id) {
        const contact = await this.findOne(createSuggestionDto.contact_id);
        if (!contact) {
          console.log('contact not found', createSuggestionDto.contact_id);
          throw new NotFoundException(`Contact with ID ${createSuggestionDto.contact_id} not found`);
        }
      }

      const suggestion = this.suggestionRepository.create({
        ...createSuggestionDto,
        suggested_by_user_id: userId
      });


      const savedSuggestion = await this.suggestionRepository.save(suggestion);

      return savedSuggestion;
    } catch (error) {
      return error
    }
  }

  async findAllSuggestions(status?: SuggestionStatus): Promise<ContactSuggestion[]> {
    const where = status ? { status } : {};
    return await this.suggestionRepository.find({
      where,
      relations: ['contact', 'suggestedBy', 'reviewedBy'],
      order: { created_at: 'DESC' }
    });
  }

  async findSuggestionsByUser(userId: string): Promise<ContactSuggestion[]> {
    return await this.suggestionRepository.find({
      where: { suggested_by_user_id: userId },
      relations: ['contact', 'suggestedBy', 'reviewedBy'],
      order: { created_at: 'DESC' }
    });
  }

  async reviewSuggestion(
    suggestionId: string,
    reviewDto: ReviewContactSuggestionDto,
    reviewerId: string
  ): Promise<ContactSuggestion> {
    const suggestion = await this.suggestionRepository.findOne({
      where: { id: suggestionId },
      relations: ['contact', 'suggestedBy']
    });

    if (!suggestion) {
      throw new NotFoundException(`Suggestion with ID ${suggestionId} not found`);
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new ForbiddenException('This suggestion has already been reviewed');
    }

    // Update suggestion
    suggestion.status = reviewDto.status;
    suggestion.reviewed_by_user_id = reviewerId;
    suggestion.reviewedAt = new Date();
    suggestion.reviewNotes = reviewDto.reviewNotes;

    // If approved, apply changes
    if (reviewDto.status === SuggestionStatus.APPROVED && suggestion.suggestedChanges) {
      if (suggestion.suggestionType === SuggestionType.UPDATE && suggestion.contact) {
        // Apply changes to existing contact
        Object.assign(suggestion.contact, suggestion.suggestedChanges);
        await this.contactRepository.save(suggestion.contact);
      } else if (suggestion.suggestionType === SuggestionType.ADD) {
        // Create new contact
        const newContact = this.contactRepository.create(suggestion.suggestedChanges);
        await this.contactRepository.save(newContact);
      } else if (suggestion.suggestionType === SuggestionType.DELETE && suggestion.contact) {
        // Soft delete contact
        suggestion.contact.isActive = false;
        await this.contactRepository.save(suggestion.contact);
      }
    }

    return await this.suggestionRepository.save(suggestion);
  }

  // === BULK OPERATIONS ===

  async bulkImport(contacts: CreateContactDto[]): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] };

    for (const contactData of contacts) {
      try {
        await this.create(contactData);
        results.success++;
      } catch (error) {
        console.log(error, 'error here');

      }
    }

    return results;
  }

  async exportContacts(organizationType?: ContactType): Promise<Contact[]> {
    const where = organizationType ? { organizationType, isActive: true } : { isActive: true };
    return await this.contactRepository.find({
      where,
      order: { organizationType: 'ASC', instituteName: 'ASC' }
    });
  }
} 