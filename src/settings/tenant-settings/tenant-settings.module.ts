import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantSettingsService } from './tenant-settings.service';
import { TenantSettingsController } from './tenant-settings.controller';
import { TenantSetting } from './entities/tenant-setting.entity';
import { ActivityLogsModule } from '../../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantSetting]),
    ActivityLogsModule,
  ],
  controllers: [TenantSettingsController],
  providers: [TenantSettingsService],
  exports: [TenantSettingsService],
})
export class TenantSettingsModule {}
