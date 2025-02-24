import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, In, Not, MoreThan } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,  
    private readonly stripeService: StripeService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Check if tenant already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        tenantId: createSubscriptionDto.tenantId,
        status: 'active',
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Tenant already has an active subscription');
    }

    // Verify subscription plan exists
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: createSubscriptionDto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const subscription = this.subscriptionRepository.create(createSubscriptionDto);
    const savedSubscription = await this.subscriptionRepository.save(subscription);
      // Cancel the subscription in Stripe if stripeSubscriptionId exists


      // Send notification to tenant admin
      const tenant = await this.tenantsService.findOne(createSubscriptionDto.tenantId);
      const adminUsers = await this.usersService.findByEmailAndTenant(null, tenant.id);
      const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

    for (const admin of admins) {
      await this.notificationsService.sendNotification({
        type: 'subscription_change',
        user: admin,
        data: {
          companyName: tenant.name,
          isUpgrade: true,
          newPlan: {
            name: plan.name,
            price: plan.price,
            interval: plan.interval,
            features: plan.features,
          },
          effectiveDate: subscription.currentPeriodStart,
          nextBillingDate: subscription.currentPeriodEnd,
          billingUrl: '/billing',
          supportEmail: 'support@example.com',
        },
        tenantId: tenant.id,
      });
    }

    return savedSubscription;
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['tenant', 'plan'],
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['tenant', 'plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByTenant(tenantId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { tenantId },
      relations: ['plan'],
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);
    const oldPlan = await this.subscriptionPlanRepository.findOne({
      where: { id: subscription.planId },
    });

    if (!oldPlan) {
      throw new NotFoundException('Current subscription plan not found');
    }

    Object.assign(subscription, updateSubscriptionDto);
    const updatedSubscription = await this.subscriptionRepository.save(subscription);

    if (updateSubscriptionDto.planId && updateSubscriptionDto.planId !== oldPlan.id) {
      const newPlan = await this.subscriptionPlanRepository.findOne({
        where: { id: updateSubscriptionDto.planId },
      });

      if (!newPlan) {
        throw new NotFoundException('New subscription plan not found');
      }

      // Send notification about plan change
      const tenant = await this.tenantsService.findOne(subscription.tenantId);
      const adminUsers = await this.usersService.findByEmailAndTenant(null, tenant.id);
      const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

      for (const admin of admins) {
        await this.notificationsService.sendNotification({
          type: 'subscription_change',
          user: admin,
          data: {
            companyName: tenant.name,
            isUpgrade: newPlan.price > oldPlan.price,
            newPlan: {
              name: newPlan.name,
              price: newPlan.price,
              interval: newPlan.interval,
              features: newPlan.features,
            },
            effectiveDate: new Date(),
            nextBillingDate: subscription.currentPeriodEnd,
            billingUrl: '/billing',
            supportEmail: 'support@example.com',
          },
          tenantId: tenant.id,
        });
      }
    }

    return updatedSubscription;
  }
  // async extendActiveSubscriptions(): Promise<void> {
  //   const now = new Date();
  //   const upcomingExpirationDate = new Date(now);
  //   upcomingExpirationDate.setDate(now.getDate() + 1); 

  //   const subscriptions = await this.subscriptionRepository.find({
  //     where: {
  //       status: 'active',
  //       currentPeriodEnd: LessThan(upcomingExpirationDate),
  //     },
  //     relations: ['plan'],
  //   });

  //   for (const subscription of subscriptions) {
  //     try {
  //       // Verify the subscription status with Stripe
  //       const stripeSubscription = await this.stripeService.getStripeSubscription(String(subscription.stripeSubscriptionId));

  //       if (stripeSubscription.status === 'active') {
  //         // Extend the currentPeriodEnd based on the interval
  //         if (subscription.plan.interval === 'monthly') {
  //           subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd.setMonth(subscription.currentPeriodEnd.getMonth() + 1));
  //         } else if (subscription.plan.interval === 'yearly') {
  //           subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd.setFullYear(subscription.currentPeriodEnd.getFullYear() + 1));
  //         }
  //         await this.subscriptionRepository.save(subscription);
  //       }
  //     } catch (error) {
  //       console.error(`Failed to verify subscription ${subscription.id} with Stripe:`, error);
  //     }
  //   }
  // }
  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    subscription.cancelAt = subscription.currentPeriodEnd;
    try{
      if (subscription.stripeSubscriptionId) {
        await this.stripeService.cancelStripeSubscription(subscription.stripeSubscriptionId);
   
      }
    }catch(error){
      console.log(error);
    }

    const updatedSubscription = await this.subscriptionRepository.save(subscription);

    // Send notification about cancellation
    const tenant = await this.tenantsService.findOne(subscription.tenantId);
    const adminUsers = await this.usersService.findByEmailAndTenant(null, tenant.id);
    const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

    for (const admin of admins) {
      await this.notificationsService.sendNotification({
        type: 'subscription_change',
        user: admin,
        data: {
          companyName: tenant.name,
          isUpgrade: false,
          isCancellation: true,
          effectiveDate: subscription.canceledAt,
          nextBillingDate: subscription.currentPeriodEnd,
          billingUrl: '/billing',
          supportEmail: 'support@example.com',
        },
        tenantId: tenant.id,
      });
    }
    
    return updatedSubscription;
  }

  async checkExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: 'active',
        currentPeriodEnd: LessThan(new Date()),
      },
      relations: ['plan'],
    });

    for (const subscription of expiredSubscriptions) {
      try {
        // Verify the subscription status with Stripe
        const stripeSubscription = await this.stripeService.getStripeSubscription(String(subscription.stripeSubscriptionId));

        if (stripeSubscription.status === 'canceled') {
          // Mark the subscription as expired if it has been canceled in Stripe
          subscription.status = 'expired';
          await this.subscriptionRepository.save(subscription);

          // Send notification about expiration
          const tenant = await this.tenantsService.findOne(subscription.tenantId);
          const adminUsers = await this.usersService.findByEmailAndTenant(null, tenant.id);
          const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

          for (const admin of admins) {
            await this.notificationsService.sendNotification({
              type: 'subscription_change',
              user: admin,
              data: {
                companyName: tenant.name,
                isUpgrade: false,
                isCancellation: true,
                effectiveDate: subscription.currentPeriodEnd,
                billingUrl: '/billing',
                supportEmail: 'support@example.com',
              },
              tenantId: tenant.id,
            });
          }
        } else if (stripeSubscription.status === 'active') {
          // Extend the currentPeriodEnd based on the interval
          if (subscription.plan.interval === 'monthly') {
            subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd.setMonth(subscription.currentPeriodEnd.getMonth() + 1));
          } else if (subscription.plan.interval === 'yearly') {
            subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd.setFullYear(subscription.currentPeriodEnd.getFullYear() + 1));
          }
          await this.subscriptionRepository.save(subscription);
        }
      } catch (error) {
        console.error(`Failed to verify subscription ${subscription.id} with Stripe:`, error);
      }
    }
  }


  async getActiveSubscription(tenantId: string): Promise<Subscription | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: [
        {
          tenantId,
          status: 'active',
          cancelAt: IsNull(), 
        },
        {
          tenantId,
          status: Not('active'),
          cancelAt: MoreThan(new Date()), 
        },
      ],
      relations: ['plan'],
    });
  
    return subscription;
  }
  
}
