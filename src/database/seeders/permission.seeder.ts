import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';

@Injectable()
export class PermissionSeeder {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seed() {
    const permissions = [
      // User Management
      {
        name: 'view_users',
        description: 'Can view users in tenant',
        resource: 'users',
        action: 'read',
      },
      {
        name: 'create_users',
        description: 'Can create new users in tenant',
        resource: 'users',
        action: 'create',
      },
      {
        name: 'update_users',
        description: 'Can update users in tenant',
        resource: 'users',
        action: 'update',
      },
      {
        name: 'delete_users',
        description: 'Can delete users in tenant',
        resource: 'users',
        action: 'delete',
      },

      // Profile Management
      {
        name: 'view_profiles',
        description: 'Can view user profiles',
        resource: 'profiles',
        action: 'read',
      },
      {
        name: 'update_profiles',
        description: 'Can update user profiles',
        resource: 'profiles',
        action: 'update',
      },

      // Role Management
      {
        name: 'view_roles',
        description: 'Can view roles in tenant',
        resource: 'roles',
        action: 'read',
      },
      {
        name: 'create_roles',
        description: 'Can create new roles in tenant',
        resource: 'roles',
        action: 'create',
      },
      {
        name: 'update_roles',
        description: 'Can update roles in tenant',
        resource: 'roles',
        action: 'update',
      },
      {
        name: 'delete_roles',
        description: 'Can delete roles in tenant',
        resource: 'roles',
        action: 'delete',
      },

      // Tenant Settings
      {
        name: 'view_tenant_settings',
        description: 'Can view tenant settings',
        resource: 'tenant_settings',
        action: 'read',
      },
      {
        name: 'update_tenant_settings',
        description: 'Can update tenant settings',
        resource: 'tenant_settings',
        action: 'update',
      },

      // Activity Logs
      {
        name: 'view_activity_logs',
        description: 'Can view activity logs',
        resource: 'activity_logs',
        action: 'read',
      },

      // Dashboard
      {
        name: 'view_dashboard',
        description: 'Can view tenant dashboard',
        resource: 'dashboard',
        action: 'read',
      },

      // Notifications
      {
        name: 'view_notifications',
        description: 'Can view notifications',
        resource: 'notifications',
        action: 'read',
      },
      {
        name: 'manage_notifications',
        description: 'Can manage notification settings',
        resource: 'notifications',
        action: 'manage',
      },     {
        name: 'clearnotifications',
        description: 'Can clear notifications',
        resource: 'notifications',
        action: 'update',
      },     {
        name: 'delete_notifications',
        description: 'Can delete notifications',
        resource: 'notifications',
        action: 'delete',
      },
    ];

    for (const permission of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { name: permission.name }
      });

      if (!exists) {
        await this.permissionRepository.save(permission);
      }
    }
  }
} 