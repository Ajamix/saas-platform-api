import { IsEnum, IsString, IsOptional, IsObject, IsUUID, IsBoolean, IsIP } from 'class-validator';
import { ActivityType } from '../entities/activity-log.entity';

export class CreateActivityLogDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsString()
  action: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @IsIP()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  resourceType?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsBoolean()
  @IsOptional()
  isSystemGenerated?: boolean;

  @IsString()
  @IsOptional()
  status?: string;
}
