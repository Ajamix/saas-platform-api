import {
  IsString,
  IsOptional,
  IsDate,
  IsObject,
  IsUUID,
  IsPhoneNumber,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLinksDto {
  @ApiPropertyOptional({
    example: 'https://linkedin.com/in/johndoe',
    description: 'LinkedIn profile URL',
  })
  @IsUrl()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({
    example: 'https://twitter.com/johndoe',
    description: 'Twitter profile URL',
  })
  @IsUrl()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/johndoe',
    description: 'GitHub profile URL',
  })
  @IsUrl()
  @IsOptional()
  github?: string;

  @ApiPropertyOptional({
    example: 'https://johndoe.com',
    description: 'Personal website URL',
  })
  @IsUrl()
  @IsOptional()
  website?: string;
}

export class NotificationsPreferencesDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Whether to receive email notifications',
  })
  @IsOptional()
  email?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to receive push notifications',
  })
  @IsOptional()
  push?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to receive SMS notifications',
  })
  @IsOptional()
  sms?: boolean;
}

export class PreferencesDto {
  @ApiPropertyOptional({
    example: 'dark',
    description: 'UI theme preference',
  })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional({
    type: NotificationsPreferencesDto,
    description: 'Notification preferences',
  })
  @IsOptional()
  notifications?: NotificationsPreferencesDto;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Preferred language',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    example: 'America/New_York',
    description: 'Preferred timezone',
  })
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class CreateProfileDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the user this profile belongs to',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL of the user avatar',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'User phone number',
  })
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'User date of birth',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: 'Senior Developer',
    description: 'User job title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Engineering',
    description: 'User department',
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    example: 'Full-stack developer with 5 years of experience',
    description: 'User bio or description',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    type: SocialLinksDto,
    description: 'User social media links',
  })
  @IsObject()
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({
    type: PreferencesDto,
    description: 'User preferences',
  })
  @IsObject()
  @IsOptional()
  preferences?: PreferencesDto;

  @ApiPropertyOptional({
    example: {
      skills: ['JavaScript', 'TypeScript', 'Node.js'],
      interests: ['Open Source', 'AI', 'Cloud Computing'],
    },
    description: 'Additional metadata about the user',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
