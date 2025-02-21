import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateSuperAdminDto {
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

  @IsArray()
  @IsOptional()
  permissions?: string[];
} 