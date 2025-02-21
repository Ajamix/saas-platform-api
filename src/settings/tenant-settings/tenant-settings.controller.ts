import { Controller, Get, Post, Body, Patch, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { TenantSettingsService } from './tenant-settings.service';
import { CreateTenantSettingDto } from './dto/create-tenant-setting.dto';
import { UpdateTenantSettingDto } from './dto/update-tenant-setting.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenants/guards/tenant.guard';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { TenantSetting } from './entities/tenant-setting.entity';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Tenant Settings')
@Controller('tenant-settings')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TenantSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant settings' })
  @ApiResponse({ status: 201, description: 'Tenant settings created successfully' })
  async create(@Body() createTenantSettingDto: CreateTenantSettingDto, @Req() request: RequestWithUser) {
    return this.tenantSettingsService.create(createTenantSettingDto, request.user, request);
  }

  @Get()
  @ApiOperation({ summary: 'Get tenant settings' })
  @ApiResponse({ status: 200, description: 'Returns tenant settings' })
  async findTenantSettings(@Req() request: RequestWithUser) {
    return this.tenantSettingsService.findByTenant(request.user.tenantId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiResponse({ status: 200, description: 'Tenant settings updated successfully' })
  async update(@Body() updateTenantSettingDto: UpdateTenantSettingDto, @Req() request: RequestWithUser) {
    return this.tenantSettingsService.update(request.user.tenantId, updateTenantSettingDto, request.user, request);
  }

  @Patch('smtp')
  @ApiOperation({ summary: 'Update tenant SMTP settings' })
  @ApiResponse({ status: 200, description: 'SMTP settings updated successfully' })
  async updateSmtpSettings(@Body() smtpSettings: TenantSetting['smtpSettings'], @Req() request: RequestWithUser) {
    return this.tenantSettingsService.updateSmtpSettings(request.user.tenantId, smtpSettings, request.user, request);
  }

  @Patch('notifications')
  @ApiOperation({ summary: 'Update tenant notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings updated successfully' })
  async updateNotificationSettings(
    @Body() notificationSettings: TenantSetting['notificationSettings'],
    @Req() request: RequestWithUser,
  ) {
    return this.tenantSettingsService.updateNotificationSettings(
      request.user.tenantId,
      notificationSettings,
      request.user,
      request,
    );
  }

  @Patch('branding')
  @ApiOperation({ summary: 'Update tenant branding settings' })
  @ApiResponse({ status: 200, description: 'Branding settings updated successfully' })
  async updateBrandingSettings(
    @Body() brandingSettings: TenantSetting['brandingSettings'],
    @Req() request: RequestWithUser,
  ) {
    return this.tenantSettingsService.updateBrandingSettings(
      request.user.tenantId,
      brandingSettings,
      request.user,
      request,
    );
  }

  @Patch('security')
  @ApiOperation({ summary: 'Update tenant security settings' })
  @ApiResponse({ status: 200, description: 'Security settings updated successfully' })
  async updateSecuritySettings(
    @Body() securitySettings: TenantSetting['securitySettings'],
    @Req() request: RequestWithUser,
  ) {
    return this.tenantSettingsService.updateSecuritySettings(
      request.user.tenantId,
      securitySettings,
      request.user,
      request,
    );
  }

  @Patch('features')
  @ApiOperation({ summary: 'Update tenant feature settings' })
  @ApiResponse({ status: 200, description: 'Feature settings updated successfully' })
  async updateFeatureSettings(
    @Body() featureSettings: TenantSetting['featureSettings'],
    @Req() request: RequestWithUser,
  ) {
    return this.tenantSettingsService.updateFeatureSettings(
      request.user.tenantId,
      featureSettings,
      request.user,
      request,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Delete tenant settings' })
  @ApiResponse({ status: 200, description: 'Tenant settings deleted successfully' })
  async remove(@Req() request: RequestWithUser) {
    return this.tenantSettingsService.remove(request.user.tenantId, request.user, request);
  }
}
