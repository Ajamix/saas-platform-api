import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { GlobalSettingsModule } from '../settings/global-settings/global-settings.module';
import { TenantGuard } from './guards/tenant.guard';
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, Role, Permission, User]),
    GlobalSettingsModule,
    ActivityLogsModule,
    SuperAdminModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService, TenantGuard],
  exports: [TenantsService],
})
export class TenantsModule {}
