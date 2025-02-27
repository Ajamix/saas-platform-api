import { Module, forwardRef } from '@nestjs/common';
import { ReviewSubmissionsService } from './review-submissions.service';
import { ReviewSubmissionsController } from './review-submissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewSubmission } from './entities/review-submission.entity';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { GlobalSettingsModule } from 'src/settings/global-settings/global-settings.module';
import { UsersModule } from 'src/users/users.module';
import { Review } from 'src/reviews/entities/review.entity';
import { SubscriptionLimitsHelper } from 'src/subscriptions/helper/subscription-limits.helper';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewSubmission, Review, Subscription, GlobalSetting]), 
    GlobalSettingsModule, 
    UsersModule,
    forwardRef(() => SubscriptionsModule)
  ],
  controllers: [ReviewSubmissionsController],
  providers: [ReviewSubmissionsService, SubscriptionLimitsHelper],
  exports: [ReviewSubmissionsService]
})
export class ReviewSubmissionsModule {}
