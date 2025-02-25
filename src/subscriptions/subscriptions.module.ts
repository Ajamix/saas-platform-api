import { Module } from '@nestjs/common';
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
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      SubscriptionPlan,
      User,
      GlobalSetting,
    ]),
    SuperAdminModule,
    NotificationsModule,
    UsersModule,
    TenantsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, StripeService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
