   // src/tenants/guards/tenant.guard.ts
   import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
   import { InjectRepository } from '@nestjs/typeorm';
   import { Repository } from 'typeorm';
   import { GlobalSetting } from 'src/settings/global-settings/entities/global-setting.entity';

   @Injectable()
   export class TenantGuard implements CanActivate {
     constructor(
       @InjectRepository(GlobalSetting)
       private readonly globalSettingRepository: Repository<GlobalSetting>,
     ) {}

     async canActivate(
       context: ExecutionContext,
     ): Promise<boolean> {
       const request = context.switchToHttp().getRequest();

       // Check for maintenance mode
       const settings = await this.globalSettingRepository.findOne({
         where: { isActive: true },
         select: ['systemSettings'],
       });

       if (settings?.systemSettings?.maintenanceMode) {
         throw new ForbiddenException(settings.systemSettings.maintenanceMessage || 'The system is under maintenance.');
       }

       // Existing tenant check logic
       return request.user && request.user.tenantId;
     }
   }