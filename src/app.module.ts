import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { AuthModule } from './auth/auth.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard/admin-dashboard.module';
import { TenantDashboardModule } from './dashboard/tenant-dashboard/tenant-dashboard.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { GlobalSettingsModule } from './settings/global-settings/global-settings.module';
import { TenantSettingsModule } from './settings/tenant-settings/tenant-settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketAuthModule } from './websocket/auth/websocket-auth.module';
import { DatabaseSeederModule } from './database/seeders/database-seeder.module';
import databaseConfig from './config/database.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLoggerInterceptor } from './common/interceptors/activity-logger.interceptor';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    TenantsModule,
    AuthModule,
    SuperAdminModule,
    SubscriptionsModule,
    AdminDashboardModule,
    TenantDashboardModule,
    ProfilesModule,
    ActivityLogsModule,
    GlobalSettingsModule,
    TenantSettingsModule,
    NotificationsModule,
    WebSocketAuthModule,
    DatabaseSeederModule,
    PermissionsModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLoggerInterceptor,
    },
  ],
})
export class AppModule {
  static setupSwagger(app: any) {
    const config = new DocumentBuilder()
      .setTitle('SaaS Platform API')
      .setDescription('The SaaS Platform API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer('')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
}
