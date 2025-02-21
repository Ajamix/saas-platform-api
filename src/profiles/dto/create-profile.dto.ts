import { IsString, IsOptional, IsDate, IsObject, IsUUID, IsPhoneNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class SocialLinksDto {
  @IsUrl()
  @IsOptional()
  linkedin?: string;

  @IsUrl()
  @IsOptional()
  twitter?: string;

  @IsUrl()
  @IsOptional()
  github?: string;

  @IsUrl()
  @IsOptional()
  website?: string;
}

export class NotificationsPreferencesDto {
  @IsOptional()
  email?: boolean;

  @IsOptional()
  push?: boolean;

  @IsOptional()
  sms?: boolean;
}

export class PreferencesDto {
  @IsString()
  @IsOptional()
  theme?: string;

  @IsOptional()
  notifications?: NotificationsPreferencesDto;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class CreateProfileDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @IsObject()
  @IsOptional()
  preferences?: PreferencesDto;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
