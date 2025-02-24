import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings/global-settings.service';
import { TenantSettingsService } from './tenant-settings/tenant-settings.service';
import { GlobalSetting } from './global-settings/entities/global-setting.entity';
import { TenantSetting } from './tenant-settings/entities/tenant-setting.entity';
import { GlobalSettingsSeeder } from '../database/seeders/global-settings.seeder';
import { SuperAdminSeeder } from '../database/seeders/super-admin.seeder';
import { PermissionSeeder } from '../database/seeders/permission.seeder';

@Injectable()
export class SettingsProvider implements OnModuleInit {
  private readonly logger = new Logger(SettingsProvider.name);
  private globalSettingsCache: GlobalSetting | null = null;
  private tenantSettingsCache: Map<string, TenantSetting> = new Map();
  private hasSeededCore = false;

  constructor(
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly tenantSettingsService: TenantSettingsService,
    private readonly globalSettingsSeeder: GlobalSettingsSeeder,
    private readonly superAdminSeeder: SuperAdminSeeder,
    private readonly permissionSeeder: PermissionSeeder,
  ) {}

  async onModuleInit() {
    await this.seedCoreData();
  }

  private async seedCoreData() {
    if (this.hasSeededCore) return;

    try {
      // Always seed permissions and superadmin
      this.logger.log('Seeding permissions...');
      await this.permissionSeeder.seed();
      
      this.logger.log('Seeding superadmin...');
      await this.superAdminSeeder.seed();
      
      this.hasSeededCore = true;
    } catch (error) {
      this.logger.error('Error seeding core data:', error.message);
    }
  }

  async getEffectiveSettings(tenantId?: string): Promise<{
    smtp: any;
    notifications: any;
    security: any;
    features: any;
    branding?: any;
    payment?: any;
  }> {
    const globalSettings = await this.getGlobalSettings();
    if (!tenantId) {
      return this.transformSettings(globalSettings);
    }

    const tenantSettings = null;
    return this.mergeSettings(globalSettings, tenantSettings);
  }

  async getGlobalSettings() {
    try {
      return await this.globalSettingsService.findActive();
    } catch (error) {
      this.logger.log('No active global settings found, seeding default settings...');
      await this.globalSettingsSeeder.seed();
      return await this.globalSettingsService.findActive();
    }
  }

  private transformSettings(settings: any) {
    return {
      smtp: settings.smtpSettings,
      notifications: settings.notificationSettings,
      security: settings.systemSettings,
      features: settings.systemSettings,
      payment: settings.paymentSettings
    };
  }

  private mergeSettings(globalSettings: any, tenantSettings: any) {
    const base = this.transformSettings(globalSettings);
    if (!tenantSettings) return base;

    return {
      ...base,
      ...(tenantSettings.smtpSettings && { smtp: tenantSettings.smtpSettings }),
      ...(tenantSettings.notificationSettings && { notifications: tenantSettings.notificationSettings }),
      ...(tenantSettings.systemSettings && { security: tenantSettings.systemSettings }),
      ...(tenantSettings.systemSettings && { features: tenantSettings.systemSettings }),
      ...(tenantSettings.brandingSettings && { branding: tenantSettings.brandingSettings }),
    };
  }

  private async getTenantSettings(tenantId: string): Promise<TenantSetting | null> {
    if (!this.tenantSettingsCache.has(tenantId)) {
      try {
        const settings = await this.tenantSettingsService.findByTenant(tenantId);
        this.tenantSettingsCache.set(tenantId, settings);
      } catch (error) {
        return null;
      }
    }
    return this.tenantSettingsCache.get(tenantId) || null;
  }

  private mergeSmtpSettings(global: GlobalSetting, tenant?: TenantSetting | null) {
    if (tenant?.smtpSettings?.useCustomSmtp) {
      return tenant.smtpSettings;
    }
    return global.smtpSettings;
  }

  private mergeNotificationSettings(global: GlobalSetting, tenant?: TenantSetting | null) {
    const baseSettings = global.notificationSettings;
    if (!tenant?.notificationSettings?.useCustomNotifications) {
      return baseSettings;
    }

    return {
      ...baseSettings,
      ...tenant.notificationSettings,
      notificationTypes: {
        ...baseSettings.notificationTypes,
        ...tenant.notificationSettings.notificationTypes,
      },
    };
  }

  private mergeSecuritySettings(global: GlobalSetting, tenant?: TenantSetting | null) {
    const baseSettings = global.systemSettings;
    if (!tenant?.securitySettings) {
      return baseSettings;
    }

    return {
      ...baseSettings,
      ...tenant.securitySettings,
      passwordPolicy: {
        ...baseSettings.passwordPolicy,
        ...tenant.securitySettings.passwordPolicy,
      },
    };
  }

  private mergeFeatureSettings(global: GlobalSetting, tenant?: TenantSetting | null) {
    if (!tenant?.featureSettings) {
      return {
        enabledFeatures: [],
        customFeatures: {},
        modulesEnabled: {},
        maxUsers: 0,
        storageLimit: 0,
      };
    }

    return tenant.featureSettings;
  }

  clearCache(tenantId?: string) {
    if (tenantId) {
      this.tenantSettingsCache.delete(tenantId);
    } else {
      this.globalSettingsCache = null;
      this.tenantSettingsCache.clear();
    }
  }
} 