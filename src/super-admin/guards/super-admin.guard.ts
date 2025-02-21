import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SuperAdminService } from '../super-admin.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly superAdminService: SuperAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const superAdmin = await this.superAdminService.findSuperAdminByEmail(user.email);
    if (!superAdmin) {
      throw new UnauthorizedException('Access denied - Super Admin privileges required');
    }

    return true;
  }
} 