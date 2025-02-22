import { SetMetadata } from '@nestjs/common';

export interface ControllerPermission {
  resource: string;    // e.g., 'users', 'roles'
  actions: string[];   // e.g., ['create', 'read', 'update', 'delete']
}

export const ControllerPermissions = (resource: string, actions: string[] = ['create', 'read', 'update', 'delete']) => 
  SetMetadata('controllerPermissions', { resource, actions }); 