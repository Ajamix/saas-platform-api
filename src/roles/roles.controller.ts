import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Role } from './entities/role.entity';
import { DynamicPermissionsGuard } from '../permissions/guards/dynamic-permissions.guard';
import { ControllerPermissions } from '../permissions/decorators/controller-permissions.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
@ControllerPermissions('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, type: Role })
  create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    if (!req.user.tenantId) {
      throw new ForbiddenException('Only tenant users can create roles');
    }
    return this.rolesService.create(createRoleDto, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles for current tenant' })
  @ApiResponse({ status: 200, type: [Role] })
  findAll(@Request() req) {
    if (!req.user.tenantId) {
      throw new ForbiddenException('Only tenant users can access roles');
    }
    return this.rolesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, type: Role })
  findOne(@Param('id') id: string, @Request() req) {
    if (!req.user.tenantId) {
      throw new ForbiddenException('Only tenant users can access roles');
    }
    return this.rolesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: Role })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req,
  ) {
    if (!req.user.tenantId) {
      throw new ForbiddenException('Only tenant users can update roles');
    }
    return await this.rolesService.update(id, updateRoleDto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Role successfully deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    if (!req.user.tenantId) {
      throw new ForbiddenException('Only tenant users can delete roles');
    }
    await this.rolesService.remove(id, req.user.tenantId);
    return { message: 'Role deleted successfully' };
  }
}
