import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class DynamicPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const controller = context.getClass();
    const request = context.switchToHttp().getRequest();
    
    // Get fresh user data with relations
    console.log(request.user);
    const isSuperAdmin = request.user && request.user.isSuperAdmin; // Assuming this property exists on the user object

    // If the user is a superadmin, skip permission checks
    if (isSuperAdmin) return true;
    const user = await this.userRepository.findOne({
      where: { id: request.user.id },
      relations: {
        roles: {
          permissions: true
        }
      },
      select: {
        id: true,
        roles: {
          id: true,
          permissions: {
            id: true,
            resource: true,
            action: true
          }
        }
      }
    });

    if (!user?.roles?.[0]?.permissions) {
      throw new ForbiddenException('No permissions found');
    }

    // Rest of the permission checking logic...
    const controllerPerms = this.reflector.get<{ resource: string }>(
      'controllerPermissions',
      controller
    );

    if (!controllerPerms) return true;

    const method = request.method;
    const methodToAction = {
      GET: 'read',
      POST: 'create',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete'
    };

    const action = methodToAction[method];
    const requiredPermission = `${controllerPerms.resource}.${action}`;
    console.log(user.roles[0].permissions);
    const hasPermission = user.roles[0].permissions.some(
      p => p.name === '*' || `${p.resource}.${p.action}` === requiredPermission
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    return true;
  }
} 