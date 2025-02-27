import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionLimitsHelper } from 'src/subscriptions/helper/subscription-limits.helper';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private subscriptionLimitsHelper: SubscriptionLimitsHelper,
  ) {}
  async create(createReviewDto: CreateReviewDto, tenantId: string) {    
    const canCreate = await this.subscriptionLimitsHelper.checkReviewTypeLimit(tenantId);
    if (!canCreate) {
      throw new BadRequestException('Review creation limit reached for your subscription plan');
    }
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      tenantId,
    });
    return this.reviewsRepository.save(review);
  }

  async findAll(tenantId: string, page = 1, limit = 10, search = ''): Promise<{
    data: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.reviewsRepository.createQueryBuilder('review');
    query.where('review.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere('review.name ILIKE :search', { search: `%${search}%` });
    }
    
    const [reviews, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async findOne(id: string, tenantId: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: id.toString(), tenantId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, tenantId: string) {
    const review = await this.findOne(id, tenantId);

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return this.reviewsRepository.update(id, updateReviewDto);
  }

  async remove(id: string, tenantId: string) {
    const review = await this.findOne(id, tenantId);

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return this.reviewsRepository.softDelete(id);
  }

  async publish(id: string, tenantId: string) {
    const review = await this.findOne(id, tenantId);
    review.isPublished = !review.isPublished;
    return this.reviewsRepository.save(review);
  } 

  async getSubscriptionLimits(tenantId: string) {
    return this.subscriptionLimitsHelper.getSubscriptionLimits(tenantId);
  }
}
