import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { PermissionSeeder } from './permission.seeder';
import { GlobalSettingsSeeder } from './global-settings.seeder';
import { GlobalSetting } from '../../settings/global-settings/entities/global-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    TypeOrmModule.forFeature([GlobalSetting])
  ],
  providers: [PermissionSeeder, GlobalSettingsSeeder],
  exports: [PermissionSeeder, GlobalSettingsSeeder],
})
export class DatabaseSeederModule {} 