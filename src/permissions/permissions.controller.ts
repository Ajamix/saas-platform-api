import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from './entities/permission.entity';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}



  @Get()
  @ApiOperation({ summary: 'Get all available permissions' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of all permissions',
    type: [Permission]
  })
  findAll() {
    return this.permissionsService.findAll();
  }


}
