import { IsString, IsNotEmpty, IsNumber, IsArray, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['monthly', 'yearly'])
  interval: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 