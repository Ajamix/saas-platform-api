import { IsString, IsNumber, IsBoolean, IsObject, IsOptional, IsUUID, IsUrl, IsEmail, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class TenantSmtpSettingsDto {
  @IsBoolean()
  useCustomSmtp: boolean;

  @IsString()
  @IsOptional()
  host: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  port: number;

  @IsBoolean()
  @IsOptional()
  secure: boolean;

  @IsString()
  @IsOptional()
  user: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsEmail()
  @IsOptional()
  from: string;

  @IsString()
  @IsOptional()
  fromName: string;
}

export class TenantNotificationTypesDto {
  @IsBoolean()
  userRegistration: boolean;

  @IsBoolean()
  passwordReset: boolean;

  @IsBoolean()
  roleChanges: boolean;

  @IsBoolean()
  teamUpdates: boolean;
}

export class TenantNotificationSettingsDto {
  @IsBoolean()
  useCustomNotifications: boolean;

  @IsBoolean()
  enableEmailNotifications: boolean;

  @IsBoolean()
  enablePushNotifications: boolean;

  @IsBoolean()
  enableInAppNotifications: boolean;

  @IsObject()
  customEmailTemplates: Record<string, string>;

  @ValidateNested()
  @Type(() => TenantNotificationTypesDto)
  notificationTypes: TenantNotificationTypesDto;
}

export class BrandingSettingsDto {
  @IsUrl()
  @IsOptional()
  logo: string;

  @IsUrl()
  @IsOptional()
  favicon: string;

  @IsString()
  @IsOptional()
  primaryColor: string;

  @IsString()
  @IsOptional()
  secondaryColor: string;

  @IsString()
  companyName: string;

  @IsEmail()
  supportEmail: string;

  @IsString()
  @IsOptional()
  supportPhone: string;

  @IsString()
  @IsOptional()
  customCss: string;
}

export class TenantPasswordPolicyDto {
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

export class SecuritySettingsDto {
  @ValidateNested()
  @Type(() => TenantPasswordPolicyDto)
  passwordPolicy: TenantPasswordPolicyDto;

  @IsNumber()
  @Min(300)
  sessionTimeout: number;

  @IsArray()
  @IsString({ each: true })
  allowedIpRanges: string[];

  @IsBoolean()
  twoFactorEnabled: boolean;

  @IsArray()
  @IsString({ each: true })
  allowedAuthMethods: string[];
}

export class FeatureSettingsDto {
  @IsArray()
  @IsString({ each: true })
  enabledFeatures: string[];

  @IsObject()
  customFeatures: Record<string, boolean>;

  @IsObject()
  modulesEnabled: Record<string, boolean>;

  @IsNumber()
  @Min(1)
  maxUsers: number;

  @IsNumber()
  @Min(1)
  storageLimit: number;
}

export class WebhookDto {
  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];

  @IsBoolean()
  isActive: boolean;
}

export class IntegrationSettingsDto {
  @IsArray()
  @IsString({ each: true })
  enabledIntegrations: string[];

  @IsObject()
  integrationConfigs: Record<string, any>;

  @ValidateNested({ each: true })
  @Type(() => WebhookDto)
  webhooks: WebhookDto[];
}

export class CreateTenantSettingDto {
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ValidateNested()
  @Type(() => TenantSmtpSettingsDto)
  @IsOptional()
  smtpSettings?: TenantSmtpSettingsDto;

  @ValidateNested()
  @Type(() => TenantNotificationSettingsDto)
  @IsOptional()
  notificationSettings?: TenantNotificationSettingsDto;

  @ValidateNested()
  @Type(() => BrandingSettingsDto)
  @IsOptional()
  brandingSettings?: BrandingSettingsDto;

  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  @IsOptional()
  securitySettings?: SecuritySettingsDto;

  @ValidateNested()
  @Type(() => FeatureSettingsDto)
  @IsOptional()
  featureSettings?: FeatureSettingsDto;

  @ValidateNested()
  @Type(() => IntegrationSettingsDto)
  @IsOptional()
  integrationSettings?: IntegrationSettingsDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
