import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Memo } from './entities/memo.entity';
import { MemoStatus } from './dto/create-memo.dto';
import { MemoSignature } from './entities/memo-signature.entity';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { CreateSignatureDto, SignatureAction } from './dto/create-signature.dto';
// import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';
import { User } from '../users/entities/user.entity';
import { Module } from '../upload/upload.entity';

@Injectable()
export class MemosService {
  constructor(
    @InjectRepository(Memo)
    private readonly memoRepository: Repository<Memo>,
    @InjectRepository(MemoSignature)
    private readonly signatureRepository: Repository<MemoSignature>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
        private uploadService: UploadService,
  ) {}

  async create(createMemoDto: CreateMemoDto): Promise<Memo> {
    const { recipient_ids, ...memoData } = createMemoDto;

    // Verify all recipients exist
    const recipients = await Promise.all(
      recipient_ids.map(id => this.userRepository.findOne({ where: { id } }))
    );

    const memo = this.memoRepository.create({
      ...memoData,
      recipients: recipients.filter(user => user !== null) as User[],
    });

    return await this.memoRepository.save(memo);
  }

  async findAll(): Promise<Memo[]> {
    return await this.memoRepository.find({
      relations: ['recipients'],
      order: {
        date_of_issue: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Memo> {
    const memo = await this.memoRepository.findOne({
      where: { id },
      relations: ['recipients'],
    });

    if (!memo) {
      throw new NotFoundException(`Memo with ID ${id} not found`);
    }

    return memo;
  }

  async update(id: string, updateMemoDto: UpdateMemoDto): Promise<Memo> {
    const memo = await this.findOne(id);
    const { recipient_ids, ...updateData } = updateMemoDto;

    if (recipient_ids) {
      const recipients = await Promise.all(
        recipient_ids.map(id => this.userRepository.findOne({ where: { id } }))
      );
      memo.recipients = recipients.filter(user => user !== null) as User[];
    }

    Object.assign(memo, updateData);
    return await this.memoRepository.save(memo);
  }

  async remove(id: string): Promise<void> {
    const memo = await this.findOne(id);

    // Delete associated attachments if any
    if (memo.attachments?.length) {
      await this.uploadService.deleteFiles(memo.attachments);
    }

    const result = await this.memoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Memo with ID ${id} not found`);
    }
  }

  async addAttachments(id: string, files: Express.Multer.File[]): Promise<Memo> {
    const memo = await this.findOne(id);
    
    const uploadedFiles = await this.uploadService.uploadFiles(files, Module.MEMO);
    
    // Merge new files with existing ones
    const existingFiles = memo.attachments || [];
    memo.attachments = [...existingFiles, ...uploadedFiles];
    
    return await this.memoRepository.save(memo);
  }

  async removeAttachment(id: string, fileName: string): Promise<Memo> {
    const memo = await this.findOne(id);
    
    if (!memo.attachments?.includes(fileName)) {
      throw new BadRequestException(`File ${fileName} not found in memo's attachments`);
    }

    // Remove file from storage
    await this.uploadService.deleteFiles([fileName]);

    // Remove file from memo's attachments
    memo.attachments = memo.attachments.filter(
      (attachment) => attachment !== fileName
    );

    return await this.memoRepository.save(memo);
  }

  async findByDepartment(department: string): Promise<Memo[]> {
    return await this.memoRepository.find({
      where: { department },
      relations: ['recipients'],
      order: {
        date_of_issue: 'DESC',
      },
    });
  }

  async findByRecipient(userId: string): Promise<Memo[]> {
    return await this.memoRepository.find({
      where: { recipients: { id: userId } },
      relations: ['recipients'],
      order: {
        date_of_issue: 'DESC',
      },
    });
  }

  async findAllMemos(): Promise<Memo[]> {
    return await this.memoRepository.find({
      order: {
        created_at: 'DESC',
      },
      relations: ['signatures'],
    });
  }

  async findOneMemo(id: string): Promise<Memo> {
    const memo = await this.memoRepository.findOne({
      where: { id },
      relations: ['signatures'],
    });
    if (!memo) {
      throw new NotFoundException(`Memo with ID ${id} not found`);
    }
    return memo;
  }

  async updateMemo(id: string, updateMemoDto: UpdateMemoDto): Promise<Memo> {
    const memo = await this.findOneMemo(id);
    if (memo.status !== MemoStatus.DRAFT) {
      throw new BadRequestException('Can only update memos in draft status');
    }
    


    Object.assign(memo, updateMemoDto);
    return await this.memoRepository.save(memo);
  }

  async removeMemo(id: string): Promise<void> {
    const memo = await this.findOneMemo(id);
    if (memo.status !== MemoStatus.DRAFT) {
      throw new BadRequestException('Can only delete memos in draft status');
    }
    await this.memoRepository.remove(memo);
  }

  async submitMemo(id: string): Promise<Memo> {
    const memo = await this.findOneMemo(id);
    if (memo.status !== MemoStatus.DRAFT) {
      throw new BadRequestException('Can only submit memos in draft status');
    }
    // if (!memo.approver_ids || memo.approver_ids.length === 0) {
    //   throw new BadRequestException('Must specify at least one approver');
    // }
    memo.status = MemoStatus.PENDING;
    return await this.memoRepository.save(memo);
  }

  // async createSignature(createSignatureDto: CreateSignatureDto): Promise<Memo> {
  //   const memo = await this.findOneMemo(createSignatureDto.memoId as string);
  //   // if (!memo.approver_ids.includes(createSignatureDto.signerId)) {
  //   //   throw new BadRequestException('Not authorized to sign this memo');
  //   // }

  //   const existingSignature = await this.signatureRepository.findOne({
  //     where: {
  //       memo_id: createSignatureDto.memoId,
  //       signer_id: createSignatureDto.signerId,
  //     },
  //   });

  //   if (existingSignature) {
  //     throw new BadRequestException('Already signed this memo');
  //   }

  //   const signature = this.signatureRepository.create({
  //     memo_id: createSignatureDto.memoId,
  //     signer_id: createSignatureDto.signerId,
  //     signer_name: createSignatureDto.signerName,
  //     action: createSignatureDto.action,
  //     comments: createSignatureDto.comments,
  //     signed_at: new Date(),
  //   });
  //   await this.signatureRepository.save(signature);

  //   // Update memo status based on signatures
  //   const signatures = await this.signatureRepository.find({
  //     where: { memo_id: createSignatureDto.memoId },
  //   });

  //   if (signatures.length === memo.approver_ids.length) {
  //     const allApproved = signatures.every(s => s.action === SignatureAction.APPROVE);
  //     memo.status = allApproved ? MemoStatus.APPROVED : MemoStatus.REJECTED;
  //     if (allApproved) {
  //       memo.approved_at = new Date();
  //     }
  //     await this.memoRepository.save(memo);
  //   }

  //   return this.findOneMemo(createSignatureDto.memoId as string);
  // }

  async findMemosByStatus(status: MemoStatus): Promise<Memo[]> {
    return await this.memoRepository.find({
      where: { status } as FindOptionsWhere<Memo>,
      order: {
        created_at: 'DESC',
      },
      relations: ['signatures'],
    });
  }

  // async findMemosByUser(userId: string): Promise<Memo[]> {
  //   return await this.memoRepository.find({
  //     where: [
  //       { author_id: userId },
  //       { approver_ids: userId },
  //     ] as FindOptionsWhere<Memo>[],
  //     order: {
  //       created_at: 'DESC',
  //     },
  //     relations: ['signatures'],
  //   });
  // }

  async getSignaturesByMemo(id: string): Promise<MemoSignature[]> {
    const memo = await this.findOneMemo(id);
    return await this.signatureRepository.find({
      where: { memo_id: id },
      order: {
        signed_at: 'DESC',
      },
    });
  }
} 