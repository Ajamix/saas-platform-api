import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import databaseConfig from './config/database.config';

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
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
