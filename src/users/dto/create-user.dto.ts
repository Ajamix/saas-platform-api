import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsUUID(4, { each: true })
  @IsOptional()
  roleIds?: string[];
}
