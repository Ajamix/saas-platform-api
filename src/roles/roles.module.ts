import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { User } from 'src/users/entities/user.entity';
import { GlobalSettingsModule } from '../settings/global-settings/global-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, User]),
    TenantsModule,
    GlobalSettingsModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
