import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Tenant } from '../../../tenants/entities/tenant.entity';

@Entity('tenant_settings')
export class TenantSetting extends BaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  // Custom SMTP Settings
  @Column({ type: 'jsonb', nullable: true })
  smtpSettings: {
    useCustomSmtp: boolean;
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
    useCustomNotifications: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    enableInAppNotifications: boolean;
    customEmailTemplates: Record<string, string>;
    notificationTypes: {
      userRegistration: boolean;
      passwordReset: boolean;
      roleChanges: boolean;
      teamUpdates: boolean;
    };
  };

  // Branding Settings
  @Column({ type: 'jsonb', nullable: true })
  brandingSettings: {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    supportEmail: string;
    supportPhone: string;
    customCss: string;
  };

  // Security Settings
  @Column({ type: 'jsonb', nullable: true })
  securitySettings: {
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      requireUppercase: boolean;
      requireLowercase: boolean;
    };
    sessionTimeout: number;
    allowedIpRanges: string[];
    twoFactorEnabled: boolean;
    allowedAuthMethods: string[];
  };

  // Feature Settings
  @Column({ type: 'jsonb', nullable: true })
  featureSettings: {
    enabledFeatures: string[];
    customFeatures: Record<string, boolean>;
    modulesEnabled: Record<string, boolean>;
    maxUsers: number;
    storageLimit: number;
  };

  // Integration Settings
  @Column({ type: 'jsonb', nullable: true })
  integrationSettings: {
    enabledIntegrations: string[];
    integrationConfigs: Record<string, any>;
    webhooks: {
      url: string;
      events: string[];
      isActive: boolean;
    }[];
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
