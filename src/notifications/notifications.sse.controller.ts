import { Controller, Sse, UseGuards, Headers, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from './notifications.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('notifications/sse')
@UseGuards(JwtAuthGuard)
export class NotificationsSseController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  @Sse('subscribe')
  async subscribe(
    @AuthUser() user: User,
    @Headers('origin') origin: string,
  ): Promise<Observable<MessageEvent>> {
    // Check origin against allowed origins
    const allowedOrigin =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    if (origin && origin !== allowedOrigin) {
      throw new Error('Origin not allowed');
    }

    return new Observable<MessageEvent>((subscriber) => {
      // Initial unread notifications
      this.notificationsService
        .getUnreadNotifications(user.id, user.tenantId)
        .then((notifications) => {
          subscriber.next({
            data: JSON.stringify(notifications), // Make sure to stringify the data
            type: 'notifications',
            lastEventId: Date.now().toString(),
          } as MessageEvent);
        });

      // Poll for new notifications
      const interval = setInterval(async () => {
        const notifications =
          await this.notificationsService.getUnreadNotifications(
            user.id,
            user.tenantId,
          );
        subscriber.next({
          data: JSON.stringify(notifications), // Make sure to stringify the data
          type: 'notifications',
          lastEventId: Date.now().toString(),
        } as MessageEvent);
      }, 10000);

      // Cleanup
      return () => {
        clearInterval(interval);
      };
    });
  }
}
