import { IsString, IsNumber, IsBoolean, IsObject, IsOptional, IsIn, IsUrl, IsEmail, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SmtpSettingsDto {
  @IsString()
  host: string;

  @IsNumber()
  @Min(1)
  port: number;

  @IsBoolean()
  secure: boolean;

  @IsString()
  user: string;

  @IsString()
  password: string;

  @IsEmail()
  from: string;

  @IsString()
  fromName: string;
}

export class NotificationTypesDto {
  @IsBoolean()
  userRegistration: boolean;

  @IsBoolean()
  passwordReset: boolean;

  @IsBoolean()
  subscriptionChanges: boolean;

  @IsBoolean()
  paymentReminders: boolean;

  @IsBoolean()
  systemUpdates: boolean;
}

export class NotificationSettingsDto {
  @IsBoolean()
  enableEmailNotifications: boolean;

  @IsBoolean()
  enablePushNotifications: boolean;

  @IsBoolean()
  enableInAppNotifications: boolean;

  @IsString()
  defaultEmailTemplate: string;

  @ValidateNested()
  @Type(() => NotificationTypesDto)
  notificationTypes: NotificationTypesDto;
}

export class PaymentSettingsDto {
  @IsBoolean()
  stripeEnabled: boolean;

  @IsString()
  @IsOptional()
  stripePublicKey: string;

  @IsString()
  @IsOptional()
  stripeSecretKey: string;

  @IsString()
  @IsOptional()
  stripeWebhookSecret: string;

  @IsBoolean()
  paypalEnabled: boolean;

  @IsString()
  @IsOptional()
  paypalClientId: string;

  @IsString()
  @IsOptional()
  paypalClientSecret: string;

  @IsString()
  @IsIn(['sandbox', 'production'])
  paypalEnvironment: 'sandbox' | 'production';

  @IsString()
  currency: string;
}

export class PasswordPolicyDto {
  @IsNumber()
  @Min(6)
  minLength: number;

  @IsBoolean()
  requireNumbers: boolean;

  @IsBoolean()
  requireSpecialChars: boolean;

  @IsBoolean()
  requireUppercase: boolean;

  @IsBoolean()
  requireLowercase: boolean;
}

export class SystemSettingsDto {
  @IsBoolean()
  maintenanceMode: boolean;

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
  @ValidateNested()
  @Type(() => SmtpSettingsDto)
  @IsOptional()
  smtpSettings?: SmtpSettingsDto;

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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
