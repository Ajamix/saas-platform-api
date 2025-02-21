import { Injectable } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings/global-settings.service';
import { TenantSettingsService } from './tenant-settings/tenant-settings.service';
import { GlobalSetting } from './global-settings/entities/global-setting.entity';
import { TenantSetting } from './tenant-settings/entities/tenant-setting.entity';

@Injectable()
export class SettingsProvider {
  private globalSettingsCache: GlobalSetting | null = null;
  private tenantSettingsCache: Map<string, TenantSetting> = new Map();

  constructor(
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly tenantSettingsService: TenantSettingsService,
  ) {}

  async getEffectiveSettings(tenantId?: string): Promise<{
    smtp: any;
    notifications: any;
    security: any;
    features: any;
    branding?: any;
    payment?: any;
  }> {
    const globalSettings = await this.getGlobalSettings();
    const tenantSettings = tenantId ? await this.getTenantSettings(tenantId) : null;

    return {
      smtp: this.mergeSmtpSettings(globalSettings, tenantSettings),
      notifications: this.mergeNotificationSettings(globalSettings, tenantSettings),
      security: this.mergeSecuritySettings(globalSettings, tenantSettings),
      features: this.mergeFeatureSettings(globalSettings, tenantSettings),
      ...(tenantSettings?.brandingSettings && { branding: tenantSettings.brandingSettings }),
      ...(globalSettings?.paymentSettings && { payment: globalSettings.paymentSettings }),
    };
  }

  private async getGlobalSettings(): Promise<GlobalSetting> {
    if (!this.globalSettingsCache) {
      this.globalSettingsCache = await this.globalSettingsService.findActive();
    }
    return this.globalSettingsCache;
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