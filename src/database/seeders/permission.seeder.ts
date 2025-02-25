import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';

@Injectable()
export class PermissionSeeder {
  private readonly logger = new Logger(PermissionSeeder.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seed() {
    try {
      // Always create permissions
      this.logger.log('Creating permissions...');
      const permissions = await this.seedPermissions();
      this.logger.log(`Created ${permissions.length} permissions`);

      // Check for roles and assign permissions if they exist
      const existingRoles = await this.roleRepository.find();
      if (existingRoles.length > 0) {
        this.logger.log('Found existing roles, assigning permissions...');
        for (const role of existingRoles) {
          this.logger.log(`Updating permissions for role: ${role.name}`);
          role.permissions = permissions;
          await this.roleRepository.save(role);
          this.logger.log(`Added permissions to role ${role.name}`);
        }
      } else {
        this.logger.log(
          'No roles found. Permissions created but not assigned.',
        );
      }
    } catch (error) {
      this.logger.error('Error seeding permissions:', error.message);
      throw error;
    }
  }

  private async seedPermissions(): Promise<Permission[]> {
    const permissions = [
      // User Management
      {
        name: 'view-users',
        description: 'Can view users in tenant',
        resource: 'users',
        action: 'read',
      },
      {
        name: 'create-users',
        description: 'Can create new users in tenant',
        resource: 'users',
        action: 'create',
      },
      {
        name: 'update-users',
        description: 'Can update users in tenant',
        resource: 'users',
        action: 'update',
      },
      {
        name: 'delete-users',
        description: 'Can delete users in tenant',
        resource: 'users',
        action: 'delete',
      },

      // Profile Management
      {
        name: 'view-profiles',
        description: 'Can view user profiles',
        resource: 'profiles',
        action: 'read',
      },
      {
        name: 'update-profiles',
        description: 'Can update user profiles',
        resource: 'profiles',
        action: 'update',
      },

      // Role Management
      {
        name: 'view-roles',
        description: 'Can view roles in tenant',
        resource: 'roles',
        action: 'read',
      },
      {
        name: 'create-roles',
        description: 'Can create new roles in tenant',
        resource: 'roles',
        action: 'create',
      },
      {
        name: 'update-roles',
        description: 'Can update roles in tenant',
        resource: 'roles',
        action: 'update',
      },
      {
        name: 'delete-roles',
        description: 'Can delete roles in tenant',
        resource: 'roles',
        action: 'delete',
      },

      // Tenant Settings
      {
        name: 'view-tenant-settings',
        description: 'Can view tenant settings',
        resource: 'tenant-settings',
        action: 'read',
      },
      {
        name: 'update-tenant-settings',
        description: 'Can update tenant settings',
        resource: 'tenant-settings',
        action: 'update',
      },

      // Activity Logs
      {
        name: 'view-activity-logs',
        description: 'Can view activity logs',
        resource: 'activity-logs',
        action: 'read',
      },

      // Dashboard
      {
        name: 'view-dashboard',
        description: 'Can view tenant dashboard',
        resource: 'dashboard',
        action: 'read',
      },

      // Subscriptions
      {
        name: 'create-subscriptions',
        description: 'Can create subscriptions',
        resource: 'subscriptions',
        action: 'create',
      },
      {
        name: 'view-subscriptions',
        description: 'Can view subscriptions',
        resource: 'subscriptions',
        action: 'read',
      },

      // Notifications
      {
        name: 'view-notifications',
        description: 'Can view notifications',
        resource: 'notifications',
        action: 'read',
      },
      {
        name: 'manage-notifications',
        description: 'Can manage notification settings',
        resource: 'notifications',
        action: 'manage',
      },
      {
        name: 'clear-notifications',
        description: 'Can clear notifications',
        resource: 'notifications',
        action: 'update',
      },
      {
        name: 'delete-notifications',
        description: 'Can delete notifications',
        resource: 'notifications',
        action: 'delete',
      },
    ];

    const savedPermissions: Permission[] = [];

    for (const permission of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { name: permission.name },
      });

      if (!exists) {
        const saved = await this.permissionRepository.save(permission);
        savedPermissions.push(saved);
      } else {
        savedPermissions.push(exists);
      }
    }

    return savedPermissions;
  }
}
