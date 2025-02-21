import { IsString, IsNotEmpty, IsUUID, IsOptional, IsDate, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the tenant'
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the subscription plan'
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiPropertyOptional({ 
    example: 'active',
    enum: ['active', 'canceled', 'expired'],
    description: 'Status of the subscription'
  })
  @IsString()
  @IsIn(['active', 'canceled', 'expired'])
  @IsOptional()
  status?: 'active' | 'canceled' | 'expired';

  @ApiProperty({ 
    example: '2023-01-01T00:00:00Z',
    description: 'Start date of the current period'
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  currentPeriodStart: Date;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00Z',
    description: 'End date of the current period'
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  currentPeriodEnd: Date;

  @ApiPropertyOptional({ 
    example: '2024-01-01T00:00:00Z',
    description: 'Date when the subscription will be canceled'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  cancelAt?: Date;

  @ApiPropertyOptional({ 
    example: '2023-06-01T00:00:00Z',
    description: 'Date when the subscription was canceled'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  canceledAt?: Date;

  @ApiPropertyOptional({ 
    example: 'cus_123456789',
    description: 'Stripe customer ID'
  })
  @IsString()
  @IsOptional()
  stripeCustomerId?: string;

  @ApiPropertyOptional({ 
    example: 'sub_123456789',
    description: 'Stripe subscription ID'
  })
  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @ApiPropertyOptional({ 
    example: 'I-BW452GLLBM4XG',
    description: 'PayPal subscription ID'
  })
  @IsString()
  @IsOptional()
  paypalSubscriptionId?: string;

  @ApiPropertyOptional({ 
    example: { 
      previousPlan: 'basic',
      upgradeReason: 'needed more features'
    },
    description: 'Additional metadata about the subscription'
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
