import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { OmitType } from '@nestjs/mapped-types';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  subdomain: string;
}

export class RegisterDto extends OmitType(CreateUserDto, ['tenantId', 'roleIds'] as const) {
  @IsNotEmpty()
  tenant: RegisterTenantDto;
} 