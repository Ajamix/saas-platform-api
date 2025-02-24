import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalSetting } from '../../settings/global-settings/entities/global-setting.entity';

@Injectable()
export class GlobalSettingsSeeder {
  constructor(
    @InjectRepository(GlobalSetting)
    private readonly globalSettingRepository: Repository<GlobalSetting>,
  ) {}

  async seed() {
    const existingSettings = await this.globalSettingRepository.find();
    if (existingSettings.length === 0) {
      const defaultSettings = this.globalSettingRepository.create({
        smtpSettings: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: 'your-email@gmail.com',
          password: 'your-app-password',
          from: 'your-email@gmail.com',
          fromName: 'Your Application Name',
        },
        notificationSettings: {
          enableEmailNotifications: true,
          enablePushNotifications: false,
          enableInAppNotifications: true,
          defaultEmailTemplate: 'default',
          notificationTypes: {
            userRegistration: true,
            passwordReset: true,
            subscriptionChanges: true,
            paymentReminders: true,
            systemUpdates: true,
          },
        },
        paymentSettings: {
          stripeEnabled: false,
          stripePublicKey: '',
          stripeSecretKey: '',
          stripeWebhookSecret: '',
          paypalEnabled: false,
          paypalClientId: '',
          paypalClientSecret: '',
          paypalEnvironment: 'sandbox',
          currency: 'USD',
        },
        systemSettings: {
          maintenanceMode: false,
          maintenanceMessage: '',
          allowUserRegistration: true,
          requireEmailVerification: true,
          defaultUserRole: 'Admin',
          passwordPolicy: {
            minLength: 8,
            requireNumbers: true,
            requireSpecialChars: true,
            requireUppercase: true,
            requireLowercase: true,
          },
          sessionTimeout: 15,
        },
        isActive: true,
      });

      await this.globalSettingRepository.save(defaultSettings);
      console.log('Default global settings created');
    }
  }
} 