import { BadRequestException, Injectable, NotFoundException   } from '@nestjs/common';
import { CreateReviewSubmissionDto } from './dto/create-review-submission.dto';
import { UpdateReviewSubmissionDto } from './dto/update-review-submission.dto';
import { Repository } from 'typeorm';
import { ReviewSubmission } from './entities/review-submission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/reviews/entities/review.entity';

@Injectable()
export class ReviewSubmissionsService { 
  constructor(
    @InjectRepository(ReviewSubmission)
    private reviewSubmissionsRepository: Repository<ReviewSubmission>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewSubmissionDto: CreateReviewSubmissionDto) {
    const reviewSubmission = this.reviewSubmissionsRepository.create({
      ...createReviewSubmissionDto,
      review: { id: createReviewSubmissionDto.reviewId },
    });
    return this.reviewSubmissionsRepository.save(reviewSubmission);
  }
  

  async findAll(
    reviewId: string,
    tenantId: string,
    page = 1,
    limit = 10,
    search = '',
  ) {
    const query = this.reviewSubmissionsRepository.createQueryBuilder(
      'reviewSubmission',
    );
  
    // Join the 'review' relation so that you can filter on its properties
    query.innerJoin('reviewSubmission.review', 'review');
  
    query.andWhere('review.id = :reviewId AND review.tenantId = :tenantId', { reviewId, tenantId });
  
    if (search) {
      query.andWhere('reviewSubmission.name ILIKE :search', {
        search: `%${search}%`,
      });
    }
  
    // Fetch the review (only selecting its 'name') if needed for the response
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      select: ['name'],
    });
  
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
      review,
    };
  }
  

  async findOne(id: string, tenantId: string) {
    const reviewSubmission = await this.reviewSubmissionsRepository.findOne({
      where: { id: id.toString(), review: { tenantId: tenantId } },
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
  async findAllPublished(reviewId: string, page = 1, limit = 5) {
    const skip = (page - 1) * limit;
  
    // Use findAndCount to get both data and total count
    const [reviewSubmissions, total] = await this.reviewSubmissionsRepository.findAndCount({
      where: {
        review: { isPublished: true, id: reviewId },
      },
      select: ['id','content', 'rating', 'createdAt','review'],
      skip,
      take: limit,
    });
  
    // Return a structured response with pagination info
    return {
      data: reviewSubmissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createPublicReviewSubmission(createReviewSubmissionDto: CreateReviewSubmissionDto, id: string) {
    const review = await this.reviewRepository.findOne({ where: { id: createReviewSubmissionDto.reviewId }})
    if (!review) {
      throw new NotFoundException(`Review with ID "${createReviewSubmissionDto.reviewId}" not found`);
    }
    if(!review.isPublished) {
      throw new BadRequestException('Review is not published yet!');
    }
    const reviewSubmission = await this.create(createReviewSubmissionDto);
    return reviewSubmission;
  }
}
