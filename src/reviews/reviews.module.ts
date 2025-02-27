import { Module, forwardRef } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { GlobalSettingsModule } from 'src/settings/global-settings/global-settings.module';
import { UsersModule } from 'src/users/users.module';
import { SubscriptionLimitsHelper } from 'src/subscriptions/helper/subscription-limits.helper';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { ReviewSubmission } from 'src/review-submissions/entities/review-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, GlobalSetting, Subscription, ReviewSubmission]),
    GlobalSettingsModule, 
    UsersModule,
    forwardRef(() => SubscriptionsModule)
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, SubscriptionLimitsHelper],
  exports: [ReviewsService]
})
export class ReviewsModule {}
