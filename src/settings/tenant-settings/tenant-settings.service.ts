import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from './entities/tenant-setting.entity';
import { CreateTenantSettingDto } from './dto/create-tenant-setting.dto';
import { UpdateTenantSettingDto } from './dto/update-tenant-setting.dto';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { User } from '../../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class TenantSettingsService {
  constructor(
    @InjectRepository(TenantSetting)
    private readonly tenantSettingRepository: Repository<TenantSetting>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(
    createTenantSettingDto: CreateTenantSettingDto,
    user: User,
    request?: Request,
  ) {
    const settings = this.tenantSettingRepository.create({
      ...createTenantSettingDto,
      tenantId: user.tenantId,
    });

    const savedSettings = await this.tenantSettingRepository.save(settings);

    return savedSettings;
  }

  async findByTenant(tenantId: string) {
    const settings = await this.tenantSettingRepository.findOne({
      where: { tenantId },
      relations: ['tenant'],
    });

    if (!settings) {
      throw new NotFoundException('Tenant settings not found');
    }

    return settings;
  }

  async update(
    tenantId: string,
    updateTenantSettingDto: UpdateTenantSettingDto,
    user: User,
    request?: Request,
  ) {
    const settings = await this.findByTenant(tenantId);

    Object.assign(settings, updateTenantSettingDto);
    const updatedSettings = await this.tenantSettingRepository.save(settings);

    return updatedSettings;
  }

  async updateSmtpSettings(
    tenantId: string,
    smtpSettings: TenantSetting['smtpSettings'],
    user: User,
    request?: Request,
  ) {
    const settings = await this.findByTenant(tenantId);

    settings.smtpSettings = {
      ...settings.smtpSettings,
      ...smtpSettings,
    };

    const updatedSettings = await this.tenantSettingRepository.save(settings);

    return updatedSettings;
  }

  async updateNotificationSettings(
    tenantId: string,
    notificationSettings: TenantSetting['notificationSettings'],
    user: User,
    request?: Request,
  ) {
    const settings = await this.findByTenant(tenantId);

    settings.notificationSettings = {
      ...settings.notificationSettings,
      ...notificationSettings,
    };

    const updatedSettings = await this.tenantSettingRepository.save(settings);

    return updatedSettings;
  }

  async updateBrandingSettings(
    tenantId: string,
    brandingSettings: TenantSetting['brandingSettings'],
    user: User,
    request?: Request,
  ) {
    const settings = await this.findByTenant(tenantId);

    settings.brandingSettings = {
      ...settings.brandingSettings,
      ...brandingSettings,
    };

    const updatedSettings = await this.tenantSettingRepository.save(settings);

    return updatedSettings;
  }

  async updateSecuritySettings(
    tenantId: string,
    securitySettings: TenantSetting['securitySettings'],
    user: User,
    request?: Request,
  ) {
    const settings = await this.findByTenant(tenantId);

    settings.securitySettings = {
      ...settings.securitySettings,
      ...securitySettings,
    };

    const updatedSettings = await this.tenantSettingRepository.save(settings);

    return updatedSettings;
  }

  async updateFeatureSettings(
    tenantId: string,
    featureSettings: TenantSetting['featureSettings'],
    user: User,
    request?: Request,
  ) {
    const settings = await this.findByTenant(tenantId);

    settings.featureSettings = {
      ...settings.featureSettings,
      ...featureSettings,
    };

    const updatedSettings = await this.tenantSettingRepository.save(settings);

    return updatedSettings;
  }

  async remove(tenantId: string, user: User, request?: Request) {
    const settings = await this.findByTenant(tenantId);
    await this.tenantSettingRepository.remove(settings);
  }
}
