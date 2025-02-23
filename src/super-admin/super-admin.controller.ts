import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSubscriptionPlanDto } from '../subscriptions/dto/create-subscription-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { AuthUser } from '../auth/decorators/auth-user.decorator';

@ApiTags('Super Admin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @Get('subscription-plans/admin')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscription plans (admin view)' })
  async getAllSubscriptionPlansAdmin() {
    return this.superAdminService.getAllSubscriptionPlans();
  }

  @Get('subscription-plans/admin/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription plan by ID (admin view)' })
  async getSubscriptionPlanAdmin(@Param('id') id: string) {
    return this.superAdminService.getSubscriptionPlan(id);
  }

  @Get('subscription-plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  async getAllSubscriptionPlans() {
    const plans = await this.superAdminService.getAllSubscriptionPlans();
    return plans
      .filter(plan => plan.isActive)
      .map(({ createdAt, updatedAt, ...publicData }) => publicData);
  }

  @Get('subscription-plans/:id')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  async getSubscriptionPlan(@Param('id') id: string) {
    const plan = await this.superAdminService.getSubscriptionPlan(id);
    if (!plan.isActive) {
      return null; // Will be transformed to 404 by NestJS
    }
    const { createdAt, updatedAt, ...publicData } = plan;
    return publicData;
  }


  @Patch('subscription-plans/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  async updateSubscriptionPlan(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSubscriptionPlanDto>,
  ) {
    return this.superAdminService.updateSubscriptionPlan(id, updateData);
  }

  @Delete('subscription-plans/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  async deleteSubscriptionPlan(@Param('id') id: string) {
    return this.superAdminService.deleteSubscriptionPlan(id);
  }
} 