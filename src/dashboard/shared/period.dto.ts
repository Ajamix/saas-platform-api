import { IsEnum, IsOptional } from 'class-validator';

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class PeriodQueryDto {
  @IsEnum(PeriodType)
  @IsOptional()
  period?: PeriodType = PeriodType.MONTHLY;
}
