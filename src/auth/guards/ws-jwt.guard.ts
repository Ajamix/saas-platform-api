import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new WsException('User not found');
      }

      // Attach user to socket handshake for later use
      client.handshake.auth.user = user;

      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth.token || client.handshake.headers.authorization;
    
    if (!auth) {
      return undefined;
    }

    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
} 