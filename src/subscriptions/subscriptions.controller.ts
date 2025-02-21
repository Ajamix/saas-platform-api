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
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @UseGuards(SuperAdminGuard)
  async findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('tenant/:tenantId')
  async findByTenant(@Param('tenantId') tenantId: string) {
    return this.subscriptionsService.findByTenant(tenantId);
  }

  @Get('active')
  async getActiveSubscription(@Query('tenantId') tenantId: string) {
    return this.subscriptionsService.getActiveSubscription(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Post(':id/cancel')
  @UseGuards(SuperAdminGuard)
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }
}
