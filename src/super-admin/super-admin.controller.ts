import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSubscriptionPlanDto } from '../subscriptions/dto/create-subscription-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  async createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return this.superAdminService.createSuperAdmin(createSuperAdminDto);
  }

  // Subscription Plan Management
  @Post('subscription-plans')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async createSubscriptionPlan(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    return this.superAdminService.createSubscriptionPlan(createSubscriptionPlanDto);
  }

  @Get('subscription-plans')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getAllSubscriptionPlans() {
    return this.superAdminService.getAllSubscriptionPlans();
  }

  @Get('subscription-plans/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getSubscriptionPlan(@Param('id') id: string) {
    return this.superAdminService.getSubscriptionPlan(id);
  }

  @Patch('subscription-plans/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async updateSubscriptionPlan(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSubscriptionPlanDto>,
  ) {
    return this.superAdminService.updateSubscriptionPlan(id, updateData);
  }

  @Delete('subscription-plans/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async deleteSubscriptionPlan(@Param('id') id: string) {
    return this.superAdminService.deleteSubscriptionPlan(id);
  }
} 