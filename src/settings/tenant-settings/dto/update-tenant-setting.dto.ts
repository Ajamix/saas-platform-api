import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTenantSettingDto } from './create-tenant-setting.dto';

export class UpdateTenantSettingDto extends PartialType(
  OmitType(CreateTenantSettingDto, ['tenantId'] as const),
) {}
