import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantDashboardService } from './tenant-dashboard.service';
import { TenantDashboardController } from './tenant-dashboard.controller';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Role } from '../../roles/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Tenant,
      Subscription,
      Role
    ]),
  ],
  controllers: [TenantDashboardController],
  providers: [TenantDashboardService]
})
export class TenantDashboardModule {}
