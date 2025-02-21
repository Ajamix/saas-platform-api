import { IsString, IsNumber, IsBoolean, IsObject, IsOptional, IsIn, IsUrl, IsEmail, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SmtpSettingsDto {
  @ApiProperty({ 
    example: 'smtp.gmail.com',
    description: 'SMTP server host'
  })
  @IsString()
  host: string;

  @ApiProperty({ 
    example: 587,
    description: 'SMTP server port'
  })
  @IsNumber()
  @Min(1)
  port: number;

  @ApiProperty({ 
    example: true,
    description: 'Whether to use SSL/TLS'
  })
  @IsBoolean()
  secure: boolean;

  @ApiProperty({ 
    example: 'user@example.com',
    description: 'SMTP authentication username'
  })
  @IsString()
  user: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'SMTP authentication password'
  })
  @IsString()
  password: string;

  @ApiProperty({ 
    example: 'noreply@example.com',
    description: 'Default sender email address'
  })
  @IsEmail()
  from: string;

  @ApiProperty({ 
    example: 'My Company',
    description: 'Default sender name'
  })
  @IsString()
  fromName: string;
}

export class NotificationTypesDto {
  @ApiProperty({ 
    example: true,
    description: 'Enable notifications for new user registrations'
  })
  @IsBoolean()
  userRegistration: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Enable notifications for password reset requests'
  })
  @IsBoolean()
  passwordReset: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Enable notifications for subscription changes'
  })
  @IsBoolean()
  subscriptionChanges: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Enable notifications for payment reminders'
  })
  @IsBoolean()
  paymentReminders: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Enable notifications for system updates'
  })
  @IsBoolean()
  systemUpdates: boolean;
}

export class NotificationSettingsDto {
  @ApiProperty({ 
    example: true,
    description: 'Enable email notifications globally'
  })
  @IsBoolean()
  enableEmailNotifications: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Enable push notifications globally'
  })
  @IsBoolean()
  enablePushNotifications: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Enable in-app notifications globally'
  })
  @IsBoolean()
  enableInAppNotifications: boolean;

  @ApiProperty({ 
    example: '<html>...</html>',
    description: 'Default email template HTML'
  })
  @IsString()
  defaultEmailTemplate: string;

  @ApiProperty({ 
    type: NotificationTypesDto,
    description: 'Configuration for different notification types'
  })
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  notificationTypes: NotificationTypesDto;
}

export class PaymentSettingsDto {
  @ApiProperty({ 
    example: true,
    description: 'Enable Stripe payment gateway'
  })
  @IsBoolean()
  stripeEnabled: boolean;

  @ApiPropertyOptional({ 
    example: 'pk_test_123',
    description: 'Stripe public key'
  })
  @IsString()
  @IsOptional()
  stripePublicKey: string;

  @ApiPropertyOptional({ 
    example: 'sk_test_123',
    description: 'Stripe secret key'
  })
  @IsString()
  @IsOptional()
  stripeSecretKey: string;

  @ApiProperty({ 
    example: 'whsec_123',
    description: 'Stripe webhook secret key'
  })
  @IsString()
  @IsOptional()
  stripeWebhookSecret: string;

  @ApiProperty({ 
    example: true,
    description: 'Enable PayPal payment gateway'
  })
  @IsBoolean()
  paypalEnabled: boolean;

  @ApiProperty({ 
    example: 'client_id_123',
    description: 'PayPal client ID'
  })
  @IsString()
  @IsOptional()
  paypalClientId: string;

  @ApiProperty({ 
    example: 'client_secret_123',
    description: 'PayPal client secret'
  })
  @IsString()
  @IsOptional()
  paypalClientSecret: string;

  @ApiProperty({ 
    example: 'sandbox',
    enum: ['sandbox', 'production'],
    description: 'PayPal environment mode'
  })
  @IsString()
  @IsIn(['sandbox', 'production'])
  paypalEnvironment: 'sandbox' | 'production';

  @ApiProperty({ 
    example: 'USD',
    description: 'Default currency for payments'
  })
  @IsString()
  currency: string;
}

export class PasswordPolicyDto {
  @ApiProperty({ 
    example: 8,
    minimum: 6,
    description: 'Minimum password length'
  })
  @IsNumber()
  @Min(6)
  minLength: number;

  @ApiProperty({ 
    example: true,
    description: 'Require numbers in password'
  })
  @IsBoolean()
  requireNumbers: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Require special characters in password'
  })
  @IsBoolean()
  requireSpecialChars: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Require uppercase letters in password'
  })
  @IsBoolean()
  requireUppercase: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Require lowercase letters in password'
  })
  @IsBoolean()
  requireLowercase: boolean;
}

export class SystemSettingsDto {
  @ApiProperty({ 
    example: false,
    description: 'Enable maintenance mode'
  })
  @IsBoolean()
  maintenanceMode: boolean;

  @ApiProperty({ 
    example: 'System under maintenance',
    description: 'Message to display during maintenance'
  })
  @IsString()
  maintenanceMessage: string;

  @IsBoolean()
  allowUserRegistration: boolean;

  @IsBoolean()
  requireEmailVerification: boolean;

  @IsString()
  defaultUserRole: string;

  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy: PasswordPolicyDto;

  @IsNumber()
  @Min(300) // 5 minutes minimum
  sessionTimeout: number;
}

export class DefaultTenantSettingsDto {
  @ApiProperty({ 
    example: true,
    description: 'Allow tenants to configure custom SMTP'
  })
  @IsBoolean()
  allowCustomSmtp: boolean;

  @IsBoolean()
  allowCustomNotifications: boolean;

  @IsNumber()
  @Min(1)
  maxUsers: number;

  @IsNumber()
  @Min(1)
  storageLimit: number;

  @IsString({ each: true })
  allowedFeatures: string[];
}

export class CreateGlobalSettingDto {
  @ApiPropertyOptional({ 
    type: SmtpSettingsDto,
    description: 'SMTP server configuration'
  })
  @ValidateNested()
  @Type(() => SmtpSettingsDto)
  @IsOptional()
  smtpSettings?: SmtpSettingsDto;

  @ApiPropertyOptional({ 
    type: NotificationSettingsDto,
    description: 'Global notification settings'
  })
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  @IsOptional()
  notificationSettings?: NotificationSettingsDto;

  @ValidateNested()
  @Type(() => PaymentSettingsDto)
  @IsOptional()
  paymentSettings?: PaymentSettingsDto;

  @ValidateNested()
  @Type(() => SystemSettingsDto)
  @IsOptional()
  systemSettings?: SystemSettingsDto;

  @ValidateNested()
  @Type(() => DefaultTenantSettingsDto)
  @IsOptional()
  defaultTenantSettings?: DefaultTenantSettingsDto;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether these settings are currently active'
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    example: { lastUpdatedBy: 'admin' },
    description: 'Additional metadata'
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
