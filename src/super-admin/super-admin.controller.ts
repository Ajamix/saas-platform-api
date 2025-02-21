import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSubscriptionPlanDto } from '../subscriptions/dto/create-subscription-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Super Admin')
@Controller('super-admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create super admin user' })
  @ApiBody({
    schema: {
      example: {
        email: "superadmin@system.com",
        password: "superSecurePass123!",
        firstName: "Super",
        lastName: "Admin",
        permissions: ["all", "manage_tenants", "manage_subscriptions"]
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Super admin created successfully',
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "superadmin@system.com",
        firstName: "Super",
        lastName: "Admin",
        isActive: true,
        permissions: ["all", "manage_tenants", "manage_subscriptions"]
      }
    }
  })
  async createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return this.superAdminService.createSuperAdmin(createSuperAdminDto);
  }

  // Subscription Plan Management
  @Post('subscription-plans')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiOperation({ summary: 'Create subscription plan' })
  @ApiBody({
    schema: {
      example: {
        name: "Professional Plan",
        description: "Perfect for growing businesses",
        price: 29.99,
        interval: "monthly",
        features: [
          "Up to 10 users",
          "24/7 support",
          "Custom domain",
          "API access"
        ],
        isActive: true
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan created successfully'
  })
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