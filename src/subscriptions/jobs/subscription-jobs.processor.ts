import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SubscriptionsService } from '../subscriptions.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { TenantsService } from '../../tenants/tenants.service';
import { UsersService } from '../../users/users.service';

@Processor('subscriptions')
export class SubscriptionJobsProcessor {
  private readonly logger = new Logger(SubscriptionJobsProcessor.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
    private readonly tenantsService: TenantsService,
    private readonly usersService: UsersService,
  ) {}

  @Process('check-expired-subscriptions')
  async handleExpiredSubscriptions(job: Job) {
    this.logger.debug('Checking for expired subscriptions...');
    try {
      await this.subscriptionsService.checkExpiredSubscriptions();
      this.logger.debug('Expired subscriptions check completed');
    } catch (error) {
      this.logger.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }

  @Process('send-payment-reminders')
  async handlePaymentReminders(job: Job) {
    this.logger.debug('Sending payment reminders...');
    try {
      const subscriptions = await this.subscriptionsService.findAll();
      const now = new Date();

      for (const subscription of subscriptions) {
        if (subscription.status === 'active') {
          const daysUntilExpiration = Math.ceil(
            (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Send reminder 7 days before expiration
          if (daysUntilExpiration === 7) {
            const tenant = await this.tenantsService.findOne(subscription.tenantId);
            const adminUsers = await this.usersService.findByEmailAndTenant(null, tenant.id);
            const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

            for (const admin of admins) {
              await this.notificationsService.sendNotification({
                type: 'payment_reminder',
                user: admin,
                data: {
                  companyName: tenant.name,
                  daysRemaining: daysUntilExpiration,
                  expirationDate: subscription.currentPeriodEnd,
                  billingUrl: '/billing',
                  supportEmail: 'support@example.com',
                },
                tenantId: tenant.id,
                isActionRequired: true,
                actionUrl: '/billing',
              });
            }
          }
        }
      }
      this.logger.debug('Payment reminders sent successfully');
    } catch (error) {
      this.logger.error('Error sending payment reminders:', error);
      throw error;
    }
  }
} 