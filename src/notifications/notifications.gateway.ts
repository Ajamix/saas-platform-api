import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WebSocketAuthGuard } from '../websocket/auth/websocket-auth.guard';
import { WsAuthUser } from '../auth/decorators/ws-auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { WebSocketAuthService } from '../websocket/auth/websocket-auth.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly wsAuthService: WebSocketAuthService) {}

  @UseGuards(WebSocketAuthGuard)
  async handleConnection(client: Socket) {
    const user = client.handshake.auth.user as User;
    if (!user) {
      client.disconnect();
      return;
    }

    // Store socket connection
    if (!this.userSockets.has(user.id)) {
      this.userSockets.set(user.id, new Set());
    }
    this.userSockets.get(user.id)!.add(client.id);

    // Store user in auth service cache
    this.wsAuthService.storeUser(user.id, user);

    // Join user-specific room and tenant room if applicable
    client.join(`user:${user.id}`);
    if (user.tenantId) {
      client.join(`tenant:${user.tenantId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.handshake.auth.user as User;
    if (user) {
      const userSocketIds = this.userSockets.get(user.id);
      if (userSocketIds) {
        userSocketIds.delete(client.id);
        if (userSocketIds.size === 0) {
          this.userSockets.delete(user.id);
          this.wsAuthService.removeUser(user.id);
        }
      }
    }
  }

  @SubscribeMessage('markAsRead')
  @UseGuards(WebSocketAuthGuard)
  async handleMarkAsRead(
    @WsAuthUser() user: User,
    payload: { notificationId: string },
  ) {
    // Handle marking notification as read
    return { success: true };
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendNotificationToTenant(tenantId: string, notification: any) {
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
  }

  sendBroadcast(notification: any) {
    this.server.emit('notification', notification);
  }
} 