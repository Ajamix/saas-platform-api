import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class SubscriptionJobsService {
  constructor(
    @InjectQueue('subscriptions')
    private readonly subscriptionsQueue: Queue,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}
  // Run every day to extend active subscriptions
  //  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  //  async scheduleExtendActiveSubscriptions() {
  //    await this.subscriptionsQueue.add('extend-active-subscriptions', {}, {
  //      attempts: 3,
  //      backoff: {
  //        type: 'exponential',
  //        delay: 60000,
  //      },
  //    });
  //  }
  // Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleSubscriptionChecks() {
    await this.subscriptionsQueue.add(
      'check-expired-subscriptions',
      {},
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute
        },
      },
    );
  }

  // Run every month on the 1st at midnight
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async schedulePaymentReminders() {
    await this.subscriptionsQueue.add(
      'send-payment-reminders',
      {},
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      },
    );
  }
}
