import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({ example: 'My Company', description: 'Name of the tenant' })
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @ApiProperty({ example: 'my-company', description: 'Subdomain for the tenant' })
  @IsString()
  @IsNotEmpty()
  subdomain: string;
}

export class RegisterDto extends OmitType(CreateUserDto, ['tenantId', 'roleIds'] as const) {
  @ApiProperty({
    description: 'Tenant information',
    type: RegisterTenantDto
  })
  @IsNotEmpty()
  tenant: RegisterTenantDto;
} 