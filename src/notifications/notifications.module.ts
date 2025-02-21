import { Module } from '@nestjs/common';
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
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, PushSubscription]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '1d',
        },
      }),
    }),
    SettingsModule,
    EmailModule,
    ActivityLogsModule,
    UsersModule,
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