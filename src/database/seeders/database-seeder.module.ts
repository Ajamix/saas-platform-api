import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { PermissionSeeder } from './permission.seeder';
import { GlobalSettingsSeeder } from './global-settings.seeder';
import { GlobalSetting } from '../../settings/global-settings/entities/global-setting.entity';
import { SuperAdmin } from '../../users/entities/super-admin.entity';
import { SuperAdminSeeder } from './super-admin.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role, GlobalSetting, SuperAdmin])
  ],
  providers: [PermissionSeeder, GlobalSettingsSeeder, SuperAdminSeeder],
  exports: [PermissionSeeder, GlobalSettingsSeeder, SuperAdminSeeder],
})
export class DatabaseSeederModule {} 