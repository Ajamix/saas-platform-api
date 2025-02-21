import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { CreateGlobalSettingDto } from './dto/create-global-setting.dto';
import { UpdateGlobalSettingDto } from './dto/update-global-setting.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../super-admin/guards/super-admin.guard';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { GlobalSetting } from './entities/global-setting.entity';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Global Settings')
@Controller('global-settings')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class GlobalSettingsController {
  constructor(private readonly globalSettingsService: GlobalSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create global settings' })
  @ApiResponse({ status: 201, description: 'Global settings created successfully' })
  async create(@Body() createGlobalSettingDto: CreateGlobalSettingDto, @Req() request: RequestWithUser) {
    return this.globalSettingsService.create(createGlobalSettingDto, request.user, request);
  }

  @Get()
  @ApiOperation({ summary: 'Get all global settings' })
  @ApiResponse({ status: 200, description: 'Returns all global settings' })
  async findAll() {
    return this.globalSettingsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active global settings' })
  @ApiResponse({ status: 200, description: 'Returns active global settings' })
  async findActive() {
    return this.globalSettingsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get global settings by ID' })
  @ApiResponse({ status: 200, description: 'Returns global settings by ID' })
  async findOne(@Param('id') id: string) {
    return this.globalSettingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update global settings' })
  @ApiResponse({ status: 200, description: 'Global settings updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateGlobalSettingDto: UpdateGlobalSettingDto,
    @Req() request: RequestWithUser,
  ) {
    return this.globalSettingsService.update(id, updateGlobalSettingDto, request.user, request);
  }

  @Patch(':id/smtp')
  @ApiOperation({ summary: 'Update SMTP settings' })
  @ApiResponse({ status: 200, description: 'SMTP settings updated successfully' })
  async updateSmtpSettings(
    @Param('id') id: string,
    @Body() smtpSettings: GlobalSetting['smtpSettings'],
    @Req() request: RequestWithUser,
  ) {
    return this.globalSettingsService.updateSmtpSettings(id, smtpSettings, request.user, request);
  }

  @Patch(':id/notifications')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings updated successfully' })
  async updateNotificationSettings(
    @Param('id') id: string,
    @Body() notificationSettings: GlobalSetting['notificationSettings'],
    @Req() request: RequestWithUser,
  ) {
    return this.globalSettingsService.updateNotificationSettings(id, notificationSettings, request.user, request);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update payment settings' })
  @ApiResponse({ status: 200, description: 'Payment settings updated successfully' })
  async updatePaymentSettings(
    @Param('id') id: string,
    @Body() paymentSettings: GlobalSetting['paymentSettings'],
    @Req() request: RequestWithUser,
  ) {
    return this.globalSettingsService.updatePaymentSettings(id, paymentSettings, request.user, request);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete global settings' })
  @ApiResponse({ status: 200, description: 'Global settings deleted successfully' })
  async remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.globalSettingsService.remove(id, request.user, request);
  }
}
