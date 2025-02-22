import { Injectable, OnModuleInit } from '@nestjs/common';
import * as webPush from 'web-push';
import { SettingsProvider } from '../../settings/settings.provider';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushNotificationsService implements OnModuleInit {
  constructor(
    private readonly settingsProvider: SettingsProvider,
    @InjectRepository(PushSubscription)
    private readonly subscriptionRepository: Repository<PushSubscription>,
  ) {}

  async onModuleInit() {
    // Temporarily skip web-push initialization
    return;
    
    // We'll enable this later when we have VAPID keys
    /*const settings = await this.settingsProvider.getEffectiveSettings();
    if (settings.notifications.enablePushNotifications) {
      webPush.setVapidDetails(
        `mailto:${settings.notifications.pushNotificationEmail}`,
        settings.notifications.vapidPublicKey,
        settings.notifications.vapidPrivateKey,
      );
    }*/
  }

  async saveSubscription(subscription: PushSubscriptionJSON, userId: string, tenantId?: string) {
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        endpoint: subscription.endpoint,
        userId,
      },
    });

    if (existingSubscription) {
      return existingSubscription;
    }

    const newSubscription = this.subscriptionRepository.create({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userId,
      tenantId,
    });

    return this.subscriptionRepository.save(newSubscription);
  }

  async removeSubscription(endpoint: string, userId: string) {
    await this.subscriptionRepository.delete({
      endpoint,
      userId,
    });
  }

  async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: any;
    },
  ) {
    const settings = await this.settingsProvider.getEffectiveSettings();
    if (!settings.notifications.enablePushNotifications) {
      return;
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
    });

    const notificationPayload = {
      notification: {
        ...notification,
        icon: notification.icon || settings.branding.logoUrl,
        badge: notification.badge || settings.branding.faviconUrl,
      },
    };

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          JSON.stringify(notificationPayload),
        );
      } catch (err) {
        if (err.statusCode === 410) {
          // Subscription has expired or is no longer valid
          await this.removeSubscription(subscription.endpoint, userId);
        }
        // Handle other errors
        console.error('Push notification error:', err);
      }
    });

    await Promise.all(sendPromises);
  }
} 