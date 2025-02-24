import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { User } from '../users/entities/user.entity';
import { GlobalSetting } from '../settings/global-settings/entities/global-setting.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog, User, GlobalSetting]),
    SuperAdminModule,
  ],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
