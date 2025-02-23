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
    // First create all permissions
    const permissions = await this.seedPermissions();

    // Find all default roles
    const defaultRoles = await this.roleRepository.find({
      where: { isDefault: true },
      relations: ['permissions']
    });

    // Update permissions for each default role
    for (const role of defaultRoles) {
      this.logger.log(`Updating permissions for default role: ${role.name}`);
      
      // Get required permissions based on role name
      const requiredPermissions = await this.getRequiredPermissionsForRole(role.name);
      
      // If role should have all permissions (*)
      if (requiredPermissions.includes('*')) {
        this.logger.log(`Granting all permissions to ${role.name}`);
        role.permissions = permissions;
        await this.roleRepository.save(role);
        continue;
      }
      
      // For other roles, filter out permissions they already have
      const existingPermissionNames = role.permissions.map(p => p.name);
      const permissionsToAdd = permissions.filter(p => 
        requiredPermissions.includes(p.name) && !existingPermissionNames.includes(p.name)
      );

      console.log('Required permissions:', requiredPermissions);
      console.log('Existing permissions:', existingPermissionNames);
      console.log('Permissions to add:', permissionsToAdd.map(p => p.name));

      if (permissionsToAdd.length > 0) {
        role.permissions = [...role.permissions, ...permissionsToAdd];
        await this.roleRepository.save(role);
        this.logger.log(`Added ${permissionsToAdd.length} permissions to role ${role.name}`);
      }
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
      },     {
        name: 'clear-notifications',
        description: 'Can clear notifications',
        resource: 'notifications',
        action: 'update',
      },     {
        name: 'delete-notifications',
        description: 'Can delete notifications',
        resource: 'notifications',
        action: 'delete',
      },
    ];

    const savedPermissions: Permission[] = [];

    for (const permission of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { name: permission.name }
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

  private async getRequiredPermissionsForRole(roleName: string): Promise<string[]> {
    // Define required permissions based on role name
    switch (roleName.toLowerCase()) {
      case 'admin':
        return ['*']; // All permissions
      case 'user':
        return ['view-notifications', 'manage-notifications', 'clear-notifications'];
      case 'manager':
        return ['view-users', 'create-users', 'view-roles', 'view-activity-logs'];
      default:
        return [];
    }
  }
} 