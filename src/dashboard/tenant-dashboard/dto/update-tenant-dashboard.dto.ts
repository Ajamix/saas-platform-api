import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDashboardDto } from './create-tenant-dashboard.dto';

export class UpdateTenantDashboardDto extends PartialType(
  CreateTenantDashboardDto,
) {}
