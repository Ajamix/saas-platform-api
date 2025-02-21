import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketAuthService } from './websocket-auth.service';
import { WebSocketAuthGuard } from './websocket-auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WebSocketAuthService, WebSocketAuthGuard],
  exports: [WebSocketAuthService, WebSocketAuthGuard],
})
export class WebSocketAuthModule {} 