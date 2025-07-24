import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Memo } from './entities/memo.entity';
import { MemoStatus } from './dto/create-memo.dto';
import { MemoSignature } from './entities/memo-signature.entity';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { CreateSignatureDto, SignatureAction } from './dto/create-signature.dto';
import { WorkflowActionDto, WorkflowAction } from './dto/workflow-action.dto';
import { DocumentGenerationService, DocumentData } from './document-generation.service';
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
    private documentGenerationService: DocumentGenerationService,
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
    memo.status = MemoStatus.PENDING_DESK_HEAD;
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

  /**
   * Submit memo to desk head for review
   */
  async submitToDeskHead(id: string, userId: string): Promise<Memo> {
    const memo = await this.findOne(id);
    
    if (memo.status !== MemoStatus.DRAFT) {
      throw new BadRequestException('Can only submit memos in draft status');
    }

    memo.status = MemoStatus.PENDING_DESK_HEAD;
    memo.submitted_to_desk_head_at = new Date();
    
    return await this.memoRepository.save(memo);
  }

  /**
   * Desk head reviews memo and performs workflow action
   */
  async deskHeadAction(id: string, workflowActionDto: WorkflowActionDto, userId: string): Promise<Memo> {
    const memo = await this.findOne(id);
    const reviewer = await this.userRepository.findOne({ where: { id: userId } });
    
    // if (!reviewer) {
    //   throw new NotFoundException('Reviewer not found');
    // }

    // if (memo.status !== MemoStatus.PENDING_DESK_HEAD) {
    //   throw new BadRequestException('Memo is not pending desk head review');
    // }

    // TODO: Add role-based authorization check for desk head role

    memo.desk_head_comment = workflowActionDto.comment;
    memo.desk_head_reviewed_at = new Date();
    memo.desk_head_reviewer = reviewer as User;

    switch (workflowActionDto.action) {
      case WorkflowAction.SUBMIT_TO_LEO:
        memo.status = MemoStatus.PENDING_LEO;
        memo.submitted_to_leo_at = new Date();
        break;
      case WorkflowAction.RETURN_TO_CREATOR:
        memo.status = MemoStatus.RETURNED_TO_CREATOR;
        break;
      case WorkflowAction.REJECT:
        memo.status = MemoStatus.REJECTED;
        break;
      default:
        throw new BadRequestException('Invalid action for desk head');
    }

    return await this.memoRepository.save(memo);
  }

  /**
   * LEO reviews memo and performs workflow action
   */
  async leoAction(id: string, workflowActionDto: WorkflowActionDto, userId: string): Promise<Memo> {
    try {
      
   
    const memo = await this.findOne(id);
    const reviewer = await this.userRepository.findOne({ where: { id: userId } });
    
    // if (!reviewer) {
    //   throw new NotFoundException('Reviewer not found');
    // }

    // if (memo.status !== MemoStatus.PENDING_LEO) {
    //   throw new BadRequestException('Memo is not pending LEO review');
    // }

    // TODO: Add role-based authorization check for LEO role

    memo.leo_comment = workflowActionDto.comment;
    memo.leo_reviewed_at = new Date();
    memo.leo_reviewer = reviewer as User;

    switch (workflowActionDto.action) {
      case WorkflowAction.APPROVE:
        memo.status = MemoStatus.APPROVED;
        memo.approved_at = new Date();
        break;
      case WorkflowAction.RETURN_TO_CREATOR:
        memo.status = MemoStatus.RETURNED_TO_CREATOR;
        break;
      case WorkflowAction.REJECT:
        memo.status = MemoStatus.REJECTED;
        break;
      default:
        console.log(workflowActionDto.action);
        throw new BadRequestException('Invalid action for LEO');
    }

    return await this.memoRepository.save(memo);
 } catch (error) {
  return error;
 }
  }

  /**
   * Generate document for approved memo
   */
  async generateDocument(id: string): Promise<any> {
    const memo = await this.findOne(id);
    
    if (memo.status !== MemoStatus.APPROVED) {
      throw new BadRequestException('Can only generate documents for approved memos');
    }

    const documentData = await this.documentGenerationService.generateDocument(memo);
    return this.documentGenerationService.generateDocumentTemplate(documentData);
  }

  /**
   * Generate HTML document for printing
   */
  async generateHTMLDocument(id: string): Promise<string> {
    const memo = await this.findOne(id);
    
    if (memo.status !== MemoStatus.APPROVED) {
      throw new BadRequestException('Can only generate documents for approved memos');
    }

    const documentData = await this.documentGenerationService.generateDocument(memo);
    return this.documentGenerationService.generateDocumentHTML(documentData);
  }

  /**
   * Get workflow history for a memo
   */
  async getWorkflowHistory(id: string): Promise<any> {
    const memo = await this.memoRepository.findOne({
      where: { id },
      relations: ['desk_head_reviewer', 'leo_reviewer'],
    });

    if (!memo) {
      throw new NotFoundException(`Memo with ID ${id} not found`);
    }

    return {
      memoId: memo.id,
      currentStatus: memo.status,
      createdAt: memo.created_at,
      submittedToDeskHeadAt: memo?.submitted_to_desk_head_at,
      deskHeadReview: memo?.desk_head_reviewed_at ? {
        reviewedAt: memo?.desk_head_reviewed_at,
        reviewer: memo.desk_head_reviewer?.id || null,
        reviewerName: memo?.desk_head_reviewer ? `${memo?.desk_head_reviewer?.firstName} ${memo?.desk_head_reviewer?.lastName}` : null,
        comment: memo?.desk_head_comment,
      } : null,
      submittedToLeoAt: memo?.submitted_to_leo_at,
      leoReview: memo?.leo_reviewed_at ? {
        reviewedAt: memo?.leo_reviewed_at,
        reviewer: memo?.leo_reviewer?.id || null,
        reviewerName: memo?.leo_reviewer ? `${memo?.leo_reviewer?.firstName} ${memo?.leo_reviewer?.lastName}` : null,
        comment: memo?.leo_comment,
      } : null,
      approvedAt: memo.approved_at,
    };
  }

  /**
   * Find memos by workflow status
   */
  async findMemosByWorkflowStatus(status: MemoStatus): Promise<Memo[]> {
    return await this.memoRepository.find({
      where: { status } as FindOptionsWhere<Memo>,
      relations: ['recipients', 'desk_head_reviewer', 'leo_reviewer'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Get memos pending for desk head review
   */
  async getMemosPendingDeskHead(): Promise<Memo[]> {
    return await this.findMemosByWorkflowStatus(MemoStatus.PENDING_DESK_HEAD);
  }

  /**
   * Get memos pending for LEO review
   */
  async getMemosPendingLEO(): Promise<Memo[]> {
    return await this.findMemosByWorkflowStatus(MemoStatus.PENDING_LEO);
  }
} 