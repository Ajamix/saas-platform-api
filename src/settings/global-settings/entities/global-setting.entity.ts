import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('global_settings')
export class GlobalSetting extends BaseEntity {
  // SMTP Settings
  @Column({ type: 'jsonb', nullable: true })
  smtpSettings: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
    fromName: string;
  };

  // Notification Settings
  @Column({ type: 'jsonb', nullable: true })
  notificationSettings: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    enableInAppNotifications: boolean;
    defaultEmailTemplate: string;
    notificationTypes: {
      userRegistration: boolean;
      passwordReset: boolean;
      subscriptionChanges: boolean;
      paymentReminders: boolean;
      systemUpdates: boolean;
    };
  };

  // Payment Gateway Settings
  @Column({ type: 'jsonb', nullable: true })
  paymentSettings: {
    stripeEnabled: boolean;
    stripePublicKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    paypalEnabled: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
    paypalEnvironment: 'sandbox' | 'production';
    currency: string;
  };

  // System Settings
  @Column({ type: 'jsonb', nullable: true })
  systemSettings: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      requireUppercase: boolean;
      requireLowercase: boolean;
    };
    sessionTimeout: number;
  };


  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
