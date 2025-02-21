import { IsString, IsNotEmpty, IsUUID, IsOptional, IsDate, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsIn(['active', 'canceled', 'expired'])
  @IsOptional()
  status?: 'active' | 'canceled' | 'expired';

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  currentPeriodStart: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  currentPeriodEnd: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  cancelAt?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  canceledAt?: Date;

  @IsString()
  @IsOptional()
  stripeCustomerId?: string;

  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @IsString()
  @IsOptional()
  paypalSubscriptionId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
