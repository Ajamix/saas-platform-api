import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionPlan } from 'src/subscriptions/entities/subscription-plan.entity';
import { User } from 'src/users/entities/user.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
@Module({ 
  imports: [TypeOrmModule.forFeature([GlobalSetting, Subscription,SubscriptionPlan,User,Tenant])],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
