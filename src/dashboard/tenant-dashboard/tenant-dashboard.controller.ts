import { Controller, Get, Query, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { TenantDashboardService } from './tenant-dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PeriodQueryDto } from '../shared/period.dto';
import { TenantDashboardStats, UserActivityStat, RoleDistribution } from '../shared/dashboard.types';

@Controller('tenant-dashboard')
@UseGuards(JwtAuthGuard)
export class TenantDashboardController {
  constructor(private readonly tenantDashboardService: TenantDashboardService) {}

  @Get()
  async getTenantDashboardStats(@Request() req): Promise<TenantDashboardStats> {
    try {
      if (!req.user?.tenantId) {
        throw new HttpException(
          'Tenant ID not found in request',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.tenantDashboardService.getTenantDashboardStats(req.user.tenantId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch tenant dashboard statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('user-activity')
  async getUserActivityStats(
    @Request() req,
    @Query() query: PeriodQueryDto
  ): Promise<UserActivityStat[]> {
    try {
      if (!req.user?.tenantId) {
        throw new HttpException(
          'Tenant ID not found in request',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.tenantDashboardService.getUserActivityStats(
        req.user.tenantId,
        query.period
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user activity statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('role-distribution')
  async getRoleDistribution(@Request() req): Promise<RoleDistribution[]> {
    try {
      if (!req.user?.tenantId) {
        throw new HttpException(
          'Tenant ID not found in request',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.tenantDashboardService.getRoleDistribution(req.user.tenantId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch role distribution',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
