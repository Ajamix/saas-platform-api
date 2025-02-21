import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { SettingsModule } from '../settings/settings.module';
import { EmailModule } from '../email/email.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { PushNotificationsService } from './push/push-notifications.service';
import { PushSubscription } from './push/entities/push-subscription.entity';
import { EmailTemplatesService } from '../email/templates/email-templates.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { WebSocketAuthModule } from '../websocket/auth/websocket-auth.module';
console.log('NotificationsModule Loaded');
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, PushSubscription]),
    ConfigModule,
    WebSocketAuthModule,
    SettingsModule,
    EmailModule,
    ActivityLogsModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    NotificationsService,
    NotificationsGateway,
    PushNotificationsService,
    EmailTemplatesService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
