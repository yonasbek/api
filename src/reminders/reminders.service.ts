import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Reminder } from './entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
  ) {}

  async create(createReminderDto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.reminderRepository.create(createReminderDto);
    return await this.reminderRepository.save(reminder);
  }

  async findAll(): Promise<Reminder[]> {
    return await this.reminderRepository.find({
      relations: ['activity'],
      order: {
        reminder_date: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['activity'],
    });

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  async update(id: string, updateReminderDto: UpdateReminderDto): Promise<Reminder> {
    const reminder = await this.findOne(id);
    Object.assign(reminder, updateReminderDto);
    return await this.reminderRepository.save(reminder);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reminderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }
  }

  async findByActivityId(activityId: string): Promise<Reminder[]> {
    return await this.reminderRepository.find({
      where: { activity: { id: activityId } },
      order: {
        reminder_date: 'ASC',
      },
    });
  }

  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    return await this.reminderRepository.find({
      where: {
        reminder_date: MoreThanOrEqual(startOfDay) && LessThanOrEqual(endOfDay),
        is_sent: false,
      },
      relations: ['activity'],
      order: {
        reminder_date: 'ASC',
      },
    });
  }

  async markAsSent(id: string): Promise<Reminder> {
    const reminder = await this.findOne(id);
    reminder.is_sent = true;
    return await this.reminderRepository.save(reminder);
  }

  async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    const now = new Date();
    const futureDate = new Date(now.setDate(now.getDate() + days));

    return await this.reminderRepository.find({
      where: {
        reminder_date: LessThanOrEqual(futureDate),
        is_sent: false,
      },
      relations: ['activity'],
      order: {
        reminder_date: 'ASC',
      },
    });
  }
} 