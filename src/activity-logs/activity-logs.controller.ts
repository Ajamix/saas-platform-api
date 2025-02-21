import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogSchema, ActivityLogResponseSchema } from '../swagger/schemas/activity-log.schema';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Activity Logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create activity log' })
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
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all activity logs (Super Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all activity logs',
    type: [ActivityLog]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Super Admin' })
  findAll() {
    return this.activityLogsService.findAll();
  }

  @Get('tenant')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get tenant activity logs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns activity logs for the current tenant',
    type: [ActivityLog]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Tenant Access' })
  findTenantLogs(@Req() request: RequestWithUser) {
    return this.activityLogsService.findByTenant(request.user.tenantId);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns activity logs for the current user',
    type: [ActivityLog]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findUserLogs(@Req() request: RequestWithUser) {
    return this.activityLogsService.findByUser(request.user.id);
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
