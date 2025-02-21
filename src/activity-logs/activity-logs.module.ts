import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { SuperAdminModule } from '../super-admin/super-admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog]),
    SuperAdminModule,
  ],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
