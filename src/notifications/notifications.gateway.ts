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
import { WsException } from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true
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
    const userRoom = `user:${user.id}`;
    await client.join(userRoom);
    
    // Send acknowledgment of automatic room join
    client.emit('joined', userRoom);
    
    console.log(`User ${user.id} connected and joined room ${userRoom}`);
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
      console.log(`User ${user.id} disconnected`);
    }
  }

  // ✅ Handle client explicitly joining a room
  @SubscribeMessage('join')
  @UseGuards(WebSocketAuthGuard)
  async handleJoinRoom(client: Socket, room: string) {
    try {
      const user = client.handshake.auth.user as User;
      if (!user) {
        throw new WsException('User not authenticated');
      }

      // Validate room format
      if (!room.startsWith('user:') && !room.startsWith('tenant:')) {
        throw new WsException('Invalid room format');
      }

      // Join the room
      await client.join(room);
      
      // Send acknowledgment
      client.emit('joined', room);
      
      console.log(`User ${user.id} joined room: ${room}`);
      
      // Log current room users
      const roomUsers = this.server.sockets.adapter.rooms.get(room);
      console.log(`Users in room ${room}:`, roomUsers ? [...roomUsers] : "No users found");

      return { success: true, room };
    } catch (error) {
      console.error('Error joining room:', error);
      throw new WsException(error.message || 'Failed to join room');
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
    console.log(`Sending notification to user: ${userId}`);
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendNotificationToTenant(tenantId: string, notification: any) {
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
  }

  sendBroadcast(notification: any) {
    this.server.emit('notification', notification);
  }
}
