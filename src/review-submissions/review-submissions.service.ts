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
  

  async findAll(reviewId: string, page = 1, limit = 10, search = '') {
    const query = this.reviewSubmissionsRepository
      .createQueryBuilder('reviewSubmission')
      .innerJoinAndSelect('reviewSubmission.review', 'review') // Ensures relation is loaded
      .where('review.id = :reviewId', { reviewId });
  
    if (search) {
      query.andWhere('reviewSubmission.content ILIKE :search', {
        search: `%${search}%`, // Ensure `content` field exists
      });
    }
  
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      select: ['name'],
    });
  
    const [reviewSubmissions, total] = await query
      .orderBy('reviewSubmission.createdAt', 'DESC') // Ensuring pagination consistency
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
  
    // Paginated review submissions
    const [reviewSubmissions, total] =
      await this.reviewSubmissionsRepository.findAndCount({
        where: {
          review: { isPublished: true, id: reviewId },
          isActive: true,
        },
        select: ['id', 'content', 'rating', 'createdAt', 'review'],
        skip,
        take: limit,
      });
  
    // Calculate the average rating
    const avgRatingResult = await this.reviewSubmissionsRepository
      .createQueryBuilder('reviewSubmission')
      .innerJoin('reviewSubmission.review', 'review')
      .select('AVG(reviewSubmission.rating)', 'avgRating')
      .where('review.id = :reviewId', { reviewId })
      .andWhere('review.isPublished = true')
      .andWhere('reviewSubmission.isActive = true')
      .getRawOne();
  
    const averageRating = parseFloat(avgRatingResult.avgRating);
  
    // Get the count for each rating (1-5)
    const ratingsCountRaw = await this.reviewSubmissionsRepository
      .createQueryBuilder('reviewSubmission')
      .innerJoin('reviewSubmission.review', 'review')
      .select('reviewSubmission.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.id = :reviewId', { reviewId })
      .andWhere('review.isPublished = true')
      .andWhere('reviewSubmission.isActive = true')
      .groupBy('reviewSubmission.rating')
      .getRawMany();
  
    // Prepare an object with ratings 1-5 initialized to zero
    const ratingsCount: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingsCountRaw.forEach((item) => {
      ratingsCount[item.rating] = parseInt(item.count, 10);
    });
  
    return {
      data: reviewSubmissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating,
      ratingsCount,
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
