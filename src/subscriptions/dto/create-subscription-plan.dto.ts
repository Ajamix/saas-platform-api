import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Premium Plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Our most popular plan' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'yearly'] })
  @IsString()
  @IsNotEmpty()
  interval: string;

  @ApiProperty({ example: ['Feature 1', 'Feature 2'] })
  @IsArray()
  @IsString({ each: true })
  features: { maxReviewTypes: number; maxSubmissionsPerReviewType: number }[];

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'https://buy.stripe.com/test_5kA17K0SQ93Sf7OeUU',
  })
  @IsString()
  stripeLink?: string;

  @ApiPropertyOptional()
  @IsString()
  stripeProductId?: string;
}
