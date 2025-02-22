import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { DynamicPermissionsGuard } from '../permissions/guards/dynamic-permissions.guard';
import { ControllerPermissions } from '../permissions/decorators/controller-permissions.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
@ControllerPermissions('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async getNotifications(@Request() req) {
    return this.notificationsService.getUnreadNotifications(req.user.id, req.user.tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    await this.notificationsService.markAsRead(id, req.user.id);
    return { 
      message: 'Notification marked as read',
      success: true 
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param('id') id: string, @Request() req) {
    await this.notificationsService.deleteNotification(id, req.user.id);
    return { 
      message: 'Notification deleted successfully',
      success: true 
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all notifications' })
  async clearNotifications(@Request() req) {
    await this.notificationsService.clearNotifications(req.user.id, req.user.tenantId);
    return { 
      message: 'All notifications cleared',
      success: true 
    };
  }
} 