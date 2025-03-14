import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { User } from 'src/users/entities/user.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { SubscriptionLimitsHelper } from './helper/subscription-limits.helper';
import { ReviewSubmissionsModule } from 'src/review-submissions/review-submissions.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { ReviewSubmission } from 'src/review-submissions/entities/review-submission.entity';
import { Review } from 'src/reviews/entities/review.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      SubscriptionPlan,
      User,
      GlobalSetting,
      ReviewSubmission,
      Review,
    ]),
    SuperAdminModule,
    NotificationsModule,
    UsersModule,
    TenantsModule,
    forwardRef(() => ReviewsModule),
    forwardRef(() => ReviewSubmissionsModule),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, StripeService, SubscriptionLimitsHelper],
  exports: [SubscriptionsService, SubscriptionLimitsHelper],
})
export class SubscriptionsModule {}
