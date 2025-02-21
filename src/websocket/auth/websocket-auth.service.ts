import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WebSocketAuthService {
  private userCache = new Map<string, any>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return payload;
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }

  storeUser(userId: string, user: any) {
    this.userCache.set(userId, user);
  }

  getUser(userId: string) {
    return this.userCache.get(userId);
  }

  removeUser(userId: string) {
    this.userCache.delete(userId);
  }
} 