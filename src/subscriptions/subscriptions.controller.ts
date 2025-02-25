import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { DynamicPermissionsGuard } from '../permissions/guards/dynamic-permissions.guard';
import { ControllerPermissions } from '../permissions/decorators/controller-permissions.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ControllerPermissions('subscriptions')
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // SUPER ADMIN ONLY
  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create subscription (Super Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    schema: {
      example: {
        message: 'Subscription created successfully',
        data: {
          /* subscription data */
        },
      },
    },
  })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionsService.create(
      createSubscriptionDto,
    );
    return {
      message: 'Subscription created successfully',
      data: subscription,
    };
  }

  // SUPER ADMIN ONLY
  // SUPER ADMIN ONLY
  @Get('all')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all subscriptions (Super Admin only)' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { data: subscriptions, total } =
      await this.subscriptionsService.findAll(page, limit);
    return {
      data: subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // TENANT ADMIN ONLY
  @Get('tenant')
  @UseGuards(TenantGuard, DynamicPermissionsGuard)
  @ApiOperation({ summary: 'Get tenant subscriptions (Tenant Admin only)' })
  async findByTenant(@Request() req) {
    const subscriptions = await this.subscriptionsService.findByTenant(
      req.user.tenantId,
    );
    return { data: subscriptions };
  }

  // TENANT USERS
  @Get('active')
  @UseGuards(TenantGuard, DynamicPermissionsGuard)
  @ApiOperation({ summary: 'Get active subscription for tenant' })
  @ApiResponse({
    status: 200,
    description: 'Returns active subscription or null if none exists',
    schema: {
      example: {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'active',
          currentPeriodStart: '2024-01-01T00:00:00Z',
          currentPeriodEnd: '2024-12-31T23:59:59Z',
          plan: {
            name: 'Premium Plan',
            price: 99.99,
            features: ['Feature 1', 'Feature 2'],
          },
        },
      },
    },
  })
  async getActiveSubscription(@Request() req) {
    const subscription = await this.subscriptionsService.getActiveSubscription(
      req.user.tenantId,
    );
    return { data: subscription };
  }

  // TENANT ADMIN OR SUPER ADMIN
  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const subscription = await this.subscriptionsService.findOne(id);
    if (!req.user.isSuperAdmin && subscription.tenantId !== req.user.tenantId) {
      throw new ForbiddenException(
        'You can only view your own tenant subscriptions',
      );
    }
    return subscription;
  }

  // SUPER ADMIN ONLY
  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update subscription (Super Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.subscriptionsService.update(
      id,
      updateSubscriptionDto,
    );
    return {
      message: 'Subscription updated successfully',
      data: subscription,
    };
  }

  // TENANT ADMIN ONLY
  @Post(':id/cancel')
  @UseGuards(TenantGuard, DynamicPermissionsGuard)
  @ApiOperation({ summary: 'Cancel subscription (Tenant Admin only)' })
  async cancel(@Param('id') id: string, @Request() req) {
    const subscription = await this.subscriptionsService.findOne(id);
    if (subscription.tenantId !== req.user.tenantId) {
      throw new ForbiddenException(
        'You can only cancel your own tenant subscription',
      );
    }
    const canceledSubscription = await this.subscriptionsService.cancel(id);
    return {
      message: 'Subscription cancelled successfully',
      data: canceledSubscription,
    };
  }
}
