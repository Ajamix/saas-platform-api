import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalSetting } from './entities/global-setting.entity';
import { CreateGlobalSettingDto } from './dto/create-global-setting.dto';
import { UpdateGlobalSettingDto } from './dto/update-global-setting.dto';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { User } from '../../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class GlobalSettingsService {
  constructor(
    @InjectRepository(GlobalSetting)
    private readonly globalSettingRepository: Repository<GlobalSetting>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(createGlobalSettingDto: CreateGlobalSettingDto, user: User, request?: Request) {
    const settings = this.globalSettingRepository.create(createGlobalSettingDto);
    const savedSettings = await this.globalSettingRepository.save(settings);

    await this.activityLogsService.logUserActivity(
      user,
      'Created global settings',
      'CREATE',
      { settingsId: savedSettings.id },
      request,
    );

    return savedSettings;
  }

  async findAll() {
    return this.globalSettingRepository.find();
  }

  async findOne(id: string) {
    const settings = await this.globalSettingRepository.findOne({
      where: { id },
    });

    if (!settings) {
      throw new NotFoundException('Global settings not found');
    }

    return settings;
  }

  async findActive() {
    const settings = await this.globalSettingRepository.findOne({
      where: { isActive: true },
    });

    if (!settings) {
      throw new NotFoundException('No active global settings found');
    }

    return settings;
  }

  async update(id: string, updateGlobalSettingDto: UpdateGlobalSettingDto, user: User, request?: Request) {
    const settings = await this.findOne(id);

    Object.assign(settings, updateGlobalSettingDto);
    const updatedSettings = await this.globalSettingRepository.save(settings);

    await this.activityLogsService.logUserActivity(
      user,
      'Updated global settings',
      'UPDATE',
      { settingsId: settings.id, changes: updateGlobalSettingDto },
      request,
    );

    return updatedSettings;
  }

  async updateSmtpSettings(id: string, smtpSettings: GlobalSetting['smtpSettings'], user: User, request?: Request) {
    const settings = await this.findOne(id);

    settings.smtpSettings = {
      ...settings.smtpSettings,
      ...smtpSettings,
    };

    const updatedSettings = await this.globalSettingRepository.save(settings);

    await this.activityLogsService.logUserActivity(
      user,
      'Updated SMTP settings',
      'SETTINGS_CHANGE',
      { settingsId: settings.id },
      request,
    );

    return updatedSettings;
  }

  async updateNotificationSettings(
    id: string,
    notificationSettings: GlobalSetting['notificationSettings'],
    user: User,
    request?: Request,
  ) {
    const settings = await this.findOne(id);

    settings.notificationSettings = {
      ...settings.notificationSettings,
      ...notificationSettings,
    };

    const updatedSettings = await this.globalSettingRepository.save(settings);

    await this.activityLogsService.logUserActivity(
      user,
      'Updated notification settings',
      'SETTINGS_CHANGE',
      { settingsId: settings.id },
      request,
    );

    return updatedSettings;
  }

  async updatePaymentSettings(id: string, paymentSettings: GlobalSetting['paymentSettings'], user: User, request?: Request) {
    const settings = await this.findOne(id);

    settings.paymentSettings = {
      ...settings.paymentSettings,
      ...paymentSettings,
    };

    const updatedSettings = await this.globalSettingRepository.save(settings);

    await this.activityLogsService.logUserActivity(
      user,
      'Updated payment settings',
      'SETTINGS_CHANGE',
      { settingsId: settings.id },
      request,
    );

    return updatedSettings;
  }

  async remove(id: string, user: User, request?: Request) {
    const settings = await this.findOne(id);
    await this.globalSettingRepository.remove(settings);

    await this.activityLogsService.logUserActivity(
      user,
      'Deleted global settings',
      'DELETE',
      { settingsId: id },
      request,
    );
  }
}
