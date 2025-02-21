import { IsString, IsNotEmpty, IsNumber, IsArray, IsBoolean, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ 
    example: 'Professional Plan',
    description: 'Name of the subscription plan'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    example: 'Perfect for growing businesses',
    description: 'Detailed description of the plan and its benefits'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 29.99,
    description: 'Monthly price of the plan in the default currency'
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ 
    example: 'monthly',
    enum: ['monthly', 'yearly'],
    description: 'Billing interval for the plan'
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['monthly', 'yearly'])
  interval: string;

  @ApiProperty({ 
    example: ['Unlimited users', '24/7 support', 'Custom domain'],
    description: 'List of features included in this plan',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether this plan is currently active and available for purchase'
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 