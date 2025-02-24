import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsProvider } from '../settings/settings.provider';
import { EmailService } from '../email/email.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { ActivityType } from '../activity-logs/entities/activity-log.entity';
import { PushNotificationsService } from './push/push-notifications.service';
import { EmailTemplatesService } from '../email/templates/email-templates.service';
import { NotificationsSse } from './notifications.sse';

export type NotificationType = 
  | 'user_registration'
  | 'password_reset'
  | 'subscription_change'
  | 'payment_reminder'
  | 'system_update'
  | 'role_change'
  | 'team_update';

interface NotificationOptions {
  type: NotificationType;
  user: User;
  data: Record<string, any>;
  tenantId?: string;
  title?: string;
  message?: string;
  isActionRequired?: boolean;
  actionUrl?: string;
  expiresAt?: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly emailService: EmailService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly notificationsSse: NotificationsSse,
    private readonly pushNotificationsService: PushNotificationsService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async sendNotification(options: NotificationOptions) {
    try {
      const { type, user, data, tenantId } = options;
      const settings = await this.settingsProvider.getEffectiveSettings(tenantId);

      // Check if notification type is enabled
      if (!this.isNotificationTypeEnabled(type, settings.notifications)) {
        return;
      }

      const promises: Promise<any>[] = [];

      // Send email notification if enabled
      // if (settings.notifications.enableEmailNotifications) {
      //   promises.push(this.sendEmailNotification(options));
      // }

      // Create and send in-app notification if enabled
      if (settings.notifications.enableInAppNotifications) {
        const notification = await this.createInAppNotification(options);
        // Send real-time notification via WebSocket
        this.notificationsSse.sendNotificationToUser(user.id, notification);
        promises.push(Promise.resolve(notification));
      }

      // Send push notification if enabled
      if (settings.notifications.enablePushNotifications) {
        promises.push(
          this.pushNotificationsService.sendPushNotification(user.id, {
            title: options.title || this.getDefaultTitle(type),
            body: options.message || this.getDefaultMessage(type, data),
            data: {
              type,
              ...data,
            },
          })
        );
      }

      // Log the notification
      promises.push(
        this.activityLogsService.create({
          type: ActivityType.NOTIFICATION_SENT,
          action: `Sent ${type} notification`,
          userId: user.id,
          tenantId: tenantId,
          details: {
            notificationType: type,
            channels: [
              settings.notifications.enableEmailNotifications && 'email',
              settings.notifications.enableInAppNotifications && 'in-app',
              settings.notifications.enablePushNotifications && 'push',
            ].filter(Boolean),
            data,
          },
        })
      );

      await Promise.all(promises);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack
      );
      console.log(`Failed to create notification: ${error.message}`);
    }
  }
  async sendTestNotificationPlease(userId: string) {
    const testNotification = {
      type: 'notifications',
      message: 'This is a test notification',
      data: { exampleKey: 'exampleValue' },
    };
    this.notificationsSse.sendNotificationToUser(userId, testNotification);
    console.log('Test notification sent to user:', userId);
  }
  private async sendEmailNotification(options: NotificationOptions) {
    const { type, user, data, tenantId } = options;
    const templateHtml = this.emailTemplatesService.renderTemplate(
      this.getEmailTemplateKey(type),
      {
        user,
        ...data,
      }
    );

    try {
      return this.emailService.sendEmail({
        to: user.email,
        subject: this.getDefaultTitle(type),
        html: templateHtml,
        tenantId,
      });
    } catch (emailError) {
      this.logger.warn(
        `Failed to send email notification: ${emailError.message}`,
        emailError.stack
      );
      // Continue execution - don't let email failures break the app
    }
  }

  private async createInAppNotification(options: NotificationOptions) {
    const {
      type,
      user,
      data,
      tenantId,
      title,
      message,
      isActionRequired = false,
      actionUrl,
      expiresAt,
    } = options;

    const notification = this.notificationRepository.create({
      type,
      title: title || this.getDefaultTitle(type),
      message: message || this.getDefaultMessage(type, data),
      data,
      user,
      userId: user.id,
      tenantId,
      isActionRequired,
      actionUrl,
      expiresAt,
    });

    return this.notificationRepository.save(notification);
  }

  private isNotificationTypeEnabled(type: NotificationType, settings: any): boolean {
    const typeMapping: Record<NotificationType, string> = {
      user_registration: 'userRegistration',
      password_reset: 'passwordReset',
      subscription_change: 'subscriptionChanges',
      payment_reminder: 'paymentReminders',
      system_update: 'systemUpdates',
      role_change: 'roleChanges',
      team_update: 'teamUpdates',
    };

    return settings.notificationTypes[typeMapping[type]] ?? false;
  }

  private getEmailTemplateKey(type: NotificationType): string {
    const templateMapping: Record<NotificationType, string> = {
      user_registration: 'user-registration',
      password_reset: 'password-reset',
      subscription_change: 'subscription-change',
      payment_reminder: 'payment-reminder',
      system_update: 'system-update',
      role_change: 'role-change',
      team_update: 'team-update',
    };

    return templateMapping[type];
  }

  private getDefaultTitle(type: NotificationType): string {
    const titleMapping: Record<NotificationType, string> = {
      user_registration: 'Welcome to the Platform',
      password_reset: 'Password Reset Request',
      subscription_change: 'Subscription Update',
      payment_reminder: 'Payment Reminder',
      system_update: 'System Update',
      role_change: 'Role Update',
      team_update: 'Team Update',
    };

    return titleMapping[type];
  }

  private getDefaultMessage(type: NotificationType, data: Record<string, any>): string {
    // TODO: Implement proper message templates
    return `Notification of type ${type}`;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
      
      // Notify other connected devices via WebSocket
      this.notificationsSse.sendNotificationToUser(userId, {
        type: 'notification_read',
        notificationId,
      });
    }
  }

  async getUnreadNotifications(userId: string, tenantId?: string) {
    return this.notificationRepository.find({
      where: {
        userId,
        tenantId,
        isRead: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    // Notify other connected devices via WebSocket
    this.notificationsSse.sendNotificationToUser(userId, {
      type: 'notification_deleted',
      notificationId,
    });
  }

  async clearNotifications(userId: string, tenantId?: string) {
    await this.notificationRepository.delete({
      userId,
      tenantId,
    });

    // Notify other connected devices via WebSocket
    this.notificationsSse.sendNotificationToUser(userId, {
      type: 'notifications_cleared',
    });
  }
} 