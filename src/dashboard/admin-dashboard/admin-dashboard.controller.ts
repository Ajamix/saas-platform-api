import { Controller, Get, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../super-admin/guards/super-admin.guard';
import { PeriodQueryDto, PeriodType } from '../shared/period.dto';
import { AdminDashboardStats, GrowthStat, RevenueStat } from '../shared/dashboard.types';

@Controller('admin-dashboard')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      return await this.adminDashboardService.getDashboardStats();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch dashboard statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tenant-growth')
  async getTenantGrowthStats(@Query() query: PeriodQueryDto): Promise<GrowthStat[]> {
    try {
      return await this.adminDashboardService.getTenantGrowthStats(query.period);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch tenant growth statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('revenue')
  async getRevenueStats(@Query() query: PeriodQueryDto): Promise<RevenueStat[]> {
    try {
      return await this.adminDashboardService.getRevenueStats(query.period);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch revenue statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
