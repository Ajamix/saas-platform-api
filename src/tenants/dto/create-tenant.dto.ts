import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'My Company', description: 'Name of the tenant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'my-company',
    description: 'Subdomain for the tenant (must be unique)',
  })
  @IsString()
  @IsNotEmpty()
  subdomain: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the tenant is active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: {
      theme: 'light',
      language: 'en',
      features: ['chat', 'notifications'],
    },
    description: 'Additional tenant settings',
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
