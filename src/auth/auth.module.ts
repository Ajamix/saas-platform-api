import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { GlobalSetting } from '../settings/global-settings/entities/global-setting.entity';
import { VerificationToken } from '../users/entities/verification-token.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    TenantsModule,
    SuperAdminModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, Tenant, GlobalSetting, VerificationToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule, TypeOrmModule.forFeature([GlobalSetting])],
      useFactory: async (configService: ConfigService, globalSettingRepository: Repository<GlobalSetting>) => {
        const globalSetting = await globalSettingRepository.findOne({
          where: { isActive: true },
          select: ['systemSettings'],
        });

        let sessionTimeoutValue: string | number | undefined = globalSetting?.systemSettings?.sessionTimeout;

        // If value is missing, fallback to default from config
        if (sessionTimeoutValue === undefined || sessionTimeoutValue === null) {
          sessionTimeoutValue = configService.get<string | number>('JWT_EXPIRATION') || '15m';
        }

        let sessionTimeout: string | number;

        if (typeof sessionTimeoutValue === 'string') {
          // Ensure it's a valid string like '15m', '2h', or convert numeric strings to numbers
          if (/^\d+$/.test(sessionTimeoutValue)) {
            sessionTimeout = Number(sessionTimeoutValue) * 60; // Convert minutes to seconds
          } else {
            sessionTimeout = sessionTimeoutValue; // Keep it as '15m', '2h', etc.
          }
        } else if (typeof sessionTimeoutValue === 'number') {
          sessionTimeout = sessionTimeoutValue * 60; // Convert minutes to seconds
        } else {
          sessionTimeout = '15m'; // Default to 15 minutes
        }
        // Set JWT_EXPIRATION in ConfigService for consistency across the app
        configService.set('JWT_EXPIRATION', sessionTimeoutValue);

        console.log('JWT_EXPIRATION set to:', sessionTimeoutValue);

        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: sessionTimeoutValue,
          },
        };
      },
      inject: [ConfigService, getRepositoryToken(GlobalSetting)],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
