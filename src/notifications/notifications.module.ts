import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { SettingsModule } from '../settings/settings.module';
import { EmailModule } from '../email/email.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { Notification } from './entities/notification.entity';
import { PushNotificationsService } from './push/push-notifications.service';
import { PushSubscription } from './push/entities/push-subscription.entity';
import { EmailTemplatesService } from '../email/templates/email-templates.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { NotificationsController } from './notifications.controller';
import { User } from 'src/users/entities/user.entity';
import { NotificationsSse } from './notifications.sse';
import { NotificationsSseController } from './notifications.sse.controller';
console.log('NotificationsModule Loaded');
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, PushSubscription, User]),
    ConfigModule,
    SettingsModule,
    EmailModule,
    ActivityLogsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationsController, NotificationsSseController],
  providers: [
    NotificationsService,
    NotificationsSse,
    PushNotificationsService,
    EmailTemplatesService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
