import { Injectable } from '@nestjs/common';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { ReviewSubmission } from 'src/review-submissions/entities/review-submission.entity';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class SubscriptionLimitsHelper {
  constructor(
    @InjectRepository(GlobalSetting)
    private globalSettingRepository: Repository<GlobalSetting>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private subscriptionsService: SubscriptionsService,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewSubmission)
    private reviewSubmissionRepository: Repository<ReviewSubmission>,
  ) {}

  async checkReviewTypeLimit(tenantId: string): Promise<boolean> {
    const subscription = await this.subscriptionsService.getActiveSubscription(tenantId);

    if (!subscription) {
      // Check if subscription has created any reviews this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const reviewCount = await this.reviewRepository.count({
        where: {
          tenantId,
          createdAt: MoreThanOrEqual(startOfMonth),
        },
      });

      return reviewCount < 1; // Only 1 review per month for free users
    }

    const maxReviewTypes = subscription.plan.features?.maxReviewTypes;
    if (!maxReviewTypes) return true; // If no limit is set, allow creation

    const reviewCount = await this.reviewRepository.count({
      where: { tenantId },
    });

    return reviewCount < maxReviewTypes;
  }

  async checkReviewSubmissionLimit(reviewId: string, tenantId: string): Promise<boolean> {
    const subscription = await this.subscriptionsService.getActiveSubscription(tenantId);


    if (!subscription) {
      // Check if subscription has created any submissions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const submissionCount = await this.reviewSubmissionRepository.count({
        where: {
          review: { tenantId },
          createdAt: MoreThanOrEqual(startOfMonth),
        },
      });

      return submissionCount < 2; 
    }

    const maxSubmissionsPerReview = subscription.plan.features?.maxSubmissionsPerReviewType;
    if (!maxSubmissionsPerReview) return true; // If no limit is set, allow creation

    const submissionCount = await this.reviewSubmissionRepository.count({
      where: { review: { id: reviewId } },
    });

    return submissionCount < maxSubmissionsPerReview;
  }
  private getStartOfMonth(): Date {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth;
  }

  async getSubscriptionLimits(tenantId: string) {
    const startOfMonth = this.getStartOfMonth();
    let isTrial = false;
    const subscription = await this.subscriptionsService.getActiveSubscription(tenantId);
    const maxReviewsPerMonth = subscription?.plan.features?.maxReviewTypes ?? 1; // Default 1 for free users
    const maxSubmissionsPerReview = subscription?.plan.features?.maxSubmissionsPerReviewType ?? 2; // Default 2 for free users
    if (maxReviewsPerMonth === 1) {
        isTrial = true;
    }
    const maxSubmissionsPerMonth = maxSubmissionsPerReview * maxReviewsPerMonth;
    // Fetch all required counts in parallel
    const [reviewCount, submissionCount, totalReviews, totalSubmissions] = await Promise.all([
      this.reviewRepository.count({ where: { tenantId, createdAt: MoreThanOrEqual(startOfMonth) } }),
      this.reviewSubmissionRepository.count({ where: { review: { tenantId }, createdAt: MoreThanOrEqual(startOfMonth) } }),
      this.reviewRepository.count({ where: { tenantId } }),
      this.reviewSubmissionRepository.count({ where: { review: { tenantId } } }),
    ]);

    // Calculate averages
    const avgSubmissionsPerReview = totalReviews > 0 ? totalSubmissions / totalReviews : 0;
    const totalMonths = Math.max(1, new Date().getMonth()); // Avoid division by zero
    const avgSubmissionsPerMonth = totalSubmissions / totalMonths;

    return {
      availableReviewsPerMonthLeft: Math.max(0, maxReviewsPerMonth - reviewCount),
      currentReviewCount: reviewCount,
      availableSubmissionsPerMonthLeft: Math.max(0, maxSubmissionsPerMonth - submissionCount),
      currentSubmissionCount: submissionCount,
      avgSubmissionsPerReview,
      avgSubmissionsPerMonth,
      isTrial,
    };
  }
}