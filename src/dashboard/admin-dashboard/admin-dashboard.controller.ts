import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../super-admin/guards/super-admin.guard';
import { PeriodQueryDto, PeriodType } from '../shared/period.dto';
import {
  AdminDashboardStats,
  GrowthStat,
  RevenueStat,
} from '../shared/dashboard.types';

@ApiTags('Admin Dashboard')
@Controller('admin-dashboard')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Super Admin' })
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      return await this.adminDashboardService.getDashboardStats();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch dashboard statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tenant-growth')
  @ApiOperation({ summary: 'Get tenant growth statistics' })
  @ApiQuery({ name: 'period', enum: PeriodType })
  @ApiResponse({
    status: 200,
    description: 'Returns tenant growth statistics',
  })
  async getTenantGrowthStats(
    @Query() query: PeriodQueryDto,
  ): Promise<GrowthStat[]> {
    try {
      return await this.adminDashboardService.getTenantGrowthStats(
        query.period,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to fetch tenant growth statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue statistics' })
  @ApiQuery({ name: 'period', enum: PeriodType })
  @ApiResponse({
    status: 200,
    description: 'Returns revenue statistics',
  })
  async getRevenueStats(
    @Query() query: PeriodQueryDto,
  ): Promise<RevenueStat[]> {
    try {
      return await this.adminDashboardService.getRevenueStats(query.period);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch revenue statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
