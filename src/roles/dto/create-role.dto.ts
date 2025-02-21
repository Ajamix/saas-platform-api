import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ 
    example: 'Admin',
    description: 'Name of the role'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    example: 'Administrator role with full access',
    description: 'Description of the role and its responsibilities'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the tenant this role belongs to'
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({ 
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Array of permission IDs assigned to this role',
    type: [String]
  })
  @IsUUID(4, { each: true })
  @IsOptional()
  permissionIds?: string[];
}
