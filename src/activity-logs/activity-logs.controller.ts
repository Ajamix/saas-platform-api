import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogSchema, ActivityLogResponseSchema } from '../swagger/schemas/activity-log.schema';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { DynamicPermissionsGuard } from '../permissions/guards/dynamic-permissions.guard';
import { ControllerPermissions } from '../permissions/decorators/controller-permissions.decorator';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@ApiTags('Activity Logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
@ControllerPermissions('activity-logs')
@ApiBearerAuth()
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create activity log' })
  @UseGuards(SuperAdminGuard)
  @ApiBody({ schema: CreateActivityLogSchema })
  @ApiResponse({ 
    status: 201, 
    description: 'Activity log created successfully',
    schema: ActivityLogResponseSchema
  })
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogsService.create(createActivityLogDto);
  }

  @Get()
  @UseGuards(TenantGuard, DynamicPermissionsGuard)
  @ApiOperation({ summary: 'Get tenant activity logs (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated activity logs for tenant',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: 'USER_LOGIN',
            action: 'User logged in',
            userId: '123e4567-e89b-12d3-a456-426614174000',
            createdAt: '2024-02-22T12:00:00Z'
          }
        ],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10
      }
    }
  })
  async findTenantLogs(@Query() query: QueryActivityLogDto, @Req() req: RequestWithUser) {
    return this.activityLogsService.findAll({
      ...query,
      tenantId: req.user.tenantId
    });
  }

  @Get('all')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all activity logs (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated activity logs for all tenants'
  })
  async findAllLogs(@Query() query: QueryActivityLogDto) {
    return this.activityLogsService.findAll(query);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns activity logs for the current user'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findUserLogs(@Query() query: QueryActivityLogDto, @Req() request: RequestWithUser) {
    return this.activityLogsService.findByUser(request.user.id, query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.activityLogsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateActivityLogDto: UpdateActivityLogDto) {
  //   return this.activityLogsService.update(+id, updateActivityLogDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.activityLogsService.remove(+id);
  // }
}
