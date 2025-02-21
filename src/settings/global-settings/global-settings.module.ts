import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalSettingsService } from './global-settings.service';
import { GlobalSettingsController } from './global-settings.controller';
import { GlobalSetting } from './entities/global-setting.entity';
import { ActivityLogsModule } from '../../activity-logs/activity-logs.module';
import { SuperAdminModule } from '../../super-admin/super-admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GlobalSetting]),
    ActivityLogsModule,
    SuperAdminModule,
  ],
  controllers: [GlobalSettingsController],
  providers: [GlobalSettingsService],
  exports: [GlobalSettingsService],
})
export class GlobalSettingsModule {}
