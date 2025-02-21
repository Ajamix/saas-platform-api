import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsUUID(4, { each: true })
  @IsOptional()
  permissionIds?: string[];
}
