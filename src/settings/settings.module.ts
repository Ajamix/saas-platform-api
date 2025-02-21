import { Module } from '@nestjs/common';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { TenantSettingsModule } from './tenant-settings/tenant-settings.module';
import { SettingsProvider } from './settings.provider';

@Module({
  imports: [GlobalSettingsModule, TenantSettingsModule],
  providers: [SettingsProvider],
  exports: [SettingsProvider, GlobalSettingsModule, TenantSettingsModule],
})
export class SettingsModule {} 