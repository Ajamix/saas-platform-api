import { IsNotEmpty, IsString, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Tenant information',
    type: RegisterTenantDto
  })
  @ValidateNested()
  @Type(() => RegisterTenantDto)
  @IsNotEmpty()
  tenant: RegisterTenantDto;
} 