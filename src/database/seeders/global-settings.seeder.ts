import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalSetting } from '../../settings/global-settings/entities/global-setting.entity';

@Injectable()
export class GlobalSettingsSeeder {
  private readonly logger = new Logger(GlobalSettingsSeeder.name);

  constructor(
    @InjectRepository(GlobalSetting)
    private readonly globalSettingRepository: Repository<GlobalSetting>,
  ) {}

  async seed() {
    try {
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
          payment: {
            stripe: {
              enabled: true,
              secretKey: process.env.STRIPE_SECRET_KEY || 'your_stripe_test_secret_key',
              publishableKey: 'pk_test_your_stripe_test_key',
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'your_stripe_webhook_secret',
              currency: 'USD'
            },
            paypal: {
              enabled: true,
              clientId: process.env.PAYPAL_CLIENT_ID || 'your_paypal_sandbox_client_id',
              clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'your_paypal_sandbox_client_secret',
              webhookId: 'your_paypal_webhook_id',
              mode: 'sandbox',
              currency: 'USD'
            },
            defaultProvider: 'paypal',
            supportedCurrencies: ['USD', 'EUR', 'GBP']
          },
          systemSettings: {
            maintenanceMode: false,
            maintenanceMessage: '',
            allowUserRegistration: true,
            requireEmailVerification: true,
            defaultUserRole: 'user',
            passwordPolicy: {
              minLength: 8,
              requireNumbers: true,
              requireSpecialChars: true,
              requireUppercase: true,
              requireLowercase: true,
            },
            sessionTimeout: 3600,
          },
          isActive: true,
        });

        await this.globalSettingRepository.save(defaultSettings);
        this.logger.log('Default global settings created successfully');
      } else {
        this.logger.log('Global settings already exist, skipping seeding');
      }
    } catch (error) {
      this.logger.error('Error seeding global settings:', error.message);
      throw error;
    }
  }
} 