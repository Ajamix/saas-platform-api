import { Module } from '@nestjs/common';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { TenantSettingsModule } from './tenant-settings/tenant-settings.module';
import { SettingsProvider } from './settings.provider';
import { DatabaseSeederModule } from '../database/seeders/database-seeder.module';

@Module({
  imports: [GlobalSettingsModule, TenantSettingsModule, DatabaseSeederModule],
  providers: [SettingsProvider],
  exports: [SettingsProvider, GlobalSettingsModule, TenantSettingsModule],
})
export class SettingsModule {} 