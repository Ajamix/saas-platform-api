import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { SuperAdminService } from '../../super-admin/super-admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly superAdminService: SuperAdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    isSuperAdmin: boolean;
    tenantId?: string;
  }) {
    if (payload.isSuperAdmin) {
      const superAdmin = await this.superAdminService.findSuperAdminByEmail(
        payload.email,
      );
      if (!superAdmin) {
        throw new UnauthorizedException();
      }
      return { ...superAdmin, isSuperAdmin: true };
    }

    if (!payload.tenantId) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findByEmailAndTenant(
      payload.email,
      payload.tenantId,
    );
    if (!user || (Array.isArray(user) ? false : !user.isActive)) {
      throw new UnauthorizedException();
    }
    return { ...(Array.isArray(user) ? user[0] : user), isSuperAdmin: false };
  }
}
