import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ 
    example: 'manage_users',
    description: 'Unique identifier for the permission'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    example: 'Allows managing user accounts',
    description: 'Detailed description of what this permission allows'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 'users',
    description: 'The resource this permission applies to'
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ 
    example: 'create',
    description: 'The action allowed on the resource (create, read, update, delete)'
  })
  @IsString()
  @IsNotEmpty()
  action: string;
}
