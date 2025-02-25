import { Injectable, NotFoundException   } from '@nestjs/common';
import { CreateReviewSubmissionDto } from './dto/create-review-submission.dto';
import { UpdateReviewSubmissionDto } from './dto/update-review-submission.dto';
import { Repository } from 'typeorm';
import { ReviewSubmission } from './entities/review-submission.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReviewSubmissionsService { 
  constructor(
    @InjectRepository(ReviewSubmission)
    private reviewSubmissionsRepository: Repository<ReviewSubmission>,
  ) {}

  async create(createReviewSubmissionDto: CreateReviewSubmissionDto, tenantId: string) {
    const reviewSubmission = this.reviewSubmissionsRepository.create({
      ...createReviewSubmissionDto,
      tenantId,
    });
    return this.reviewSubmissionsRepository.save(reviewSubmission);
  }

  async findAll(tenantId: string, page = 1, limit = 10, search = '') {
    const query = this.reviewSubmissionsRepository.createQueryBuilder('reviewSubmission');
    query.where('reviewSubmission.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere('reviewSubmission.name ILIKE :search', { search: `%${search}%` });
    }

    const [reviewSubmissions, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: reviewSubmissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, tenantId: string) {
    const reviewSubmission = await this.reviewSubmissionsRepository.findOne({
      where: { id: id.toString(), tenantId },
    });

    if (!reviewSubmission) {
      throw new NotFoundException(`Review submission with ID "${id}" not found`);
    }

    return reviewSubmission;
  }

  async update(id: string, updateReviewSubmissionDto: UpdateReviewSubmissionDto, tenantId: string) {
    const reviewSubmission = await this.findOne(id, tenantId);

    if (!reviewSubmission) {
      throw new NotFoundException(`Review submission with ID "${id}" not found`);
    }

    return this.reviewSubmissionsRepository.update(id, updateReviewSubmissionDto);
  }

  async remove(id: string, tenantId: string) {
    const reviewSubmission = await this.findOne(id, tenantId);

    if (!reviewSubmission) {
      throw new NotFoundException(`Review submission with ID "${id}" not found`);
    }

    return this.reviewSubmissionsRepository.softDelete(id);
  }
}
