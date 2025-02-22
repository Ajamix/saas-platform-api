import { Controller, Get, Query, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { TenantDashboardService } from './tenant-dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenants/guards/tenant.guard';
import { PeriodQueryDto } from '../shared/period.dto';
import { TenantDashboardStats, UserActivityStat, RoleDistribution } from '../shared/dashboard.types';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ControllerPermissions } from 'src/permissions/decorators/controller-permissions.decorator';
import { DynamicPermissionsGuard } from 'src/permissions/guards/dynamic-permissions.guard';


@ApiTags('Tenant Dashboard')
@Controller('tenant-dashboard')
@UseGuards(JwtAuthGuard, TenantGuard,DynamicPermissionsGuard)
@ControllerPermissions('dashboard')
@ApiBearerAuth()
export class TenantDashboardController {
  constructor(private readonly tenantDashboardService: TenantDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
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
