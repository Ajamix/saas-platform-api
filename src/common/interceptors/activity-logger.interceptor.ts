import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { ActivityType } from '../../activity-logs/entities/activity-log.entity';
import { Reflector } from '@nestjs/core';
import { SuperAdminService } from '../../super-admin/super-admin.service';

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly activityLogsService: ActivityLogsService,
    private readonly reflector: Reflector,
    private readonly superAdminService: SuperAdminService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const path = request.path;

    // Skip logging if no user (unauthenticated endpoints)
    if (!user || !user.id) return next.handle();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Check if user is a superadmin
          const isSuperAdmin = await this.checkIfSuperAdmin(user.email);
          if (isSuperAdmin) return; // **Skip logging for SuperAdmins**

          let activityType: ActivityType;
          let action: string;

          // Determine activity type based on HTTP method
          switch (method) {
            case 'POST':
              activityType = ActivityType.CREATE;
              action = `Created new ${this.getResourceType(path)}`;
              break;
            case 'PATCH':
            case 'PUT':
              activityType = ActivityType.UPDATE;
              action = `Updated ${this.getResourceType(path)}`;
              break;
            case 'DELETE':
              activityType = ActivityType.DELETE;
              action = `Deleted ${this.getResourceType(path)}`;
              break;
            default:
              return; // Don't log GET requests
          }

          await this.activityLogsService.logUserActivity(
            user,
            action,
            activityType,
            {
              path,
              method,
              requestBody: request.body,
              responseData: response,
              tenantId: user.tenantId, // Only log for tenants
            },
            request
          );
        } catch (error) {
          console.error('Activity logging failed:', error);
        }
      })
    );
  }

  private async checkIfSuperAdmin(email: string): Promise<boolean> {
    const superAdmin = await this.superAdminService.findSuperAdminByEmail(email);
    return !!superAdmin;
  }

  private getResourceType(path: string): string {
    // Extract resource type from path
    const parts = path.split('/');
    return parts[2] ? parts[2].replace(/s$/, '') : 'unknown'; // Remove 's' from plural
  }
}
