import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TenantsModule } from '../tenants/tenants.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { Role } from '../roles/entities/role.entity';
import { GlobalSettingsModule } from '../settings/global-settings/global-settings.module';
import { VerificationToken } from './entities/verification-token.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, VerificationToken]),
    SuperAdminModule,
    forwardRef(() => NotificationsModule),
    TenantsModule,
    ActivityLogsModule,
    GlobalSettingsModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService,TypeOrmModule],
})
export class UsersModule {}
