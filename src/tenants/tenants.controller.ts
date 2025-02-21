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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { CreateTenantSchema, TenantResponseSchema } from '../swagger/schemas/tenant.schema';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create new tenant' })
  @ApiBody({ schema: CreateTenantSchema })
  @ApiResponse({ 
    status: 201, 
    description: 'Tenant created successfully',
    schema: TenantResponseSchema
  })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(SuperAdminGuard)
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get('current')
  async getCurrentTenant(@Request() req) {
    if (req.user.isSuperAdmin) {
      throw new ForbiddenException('SuperAdmin does not belong to any tenant');
    }
    return this.tenantsService.findOne(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const tenant = await this.tenantsService.findOne(id);

    // Regular users can only view their own tenant
    if (!req.user.isSuperAdmin && tenant.id !== req.user.tenantId) {
      throw new ForbiddenException('You can only view your own tenant');
    }

    return tenant;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @Request() req,
  ) {
    const tenant = await this.tenantsService.findOne(id);

    // Regular users can only update their own tenant
    if (!req.user.isSuperAdmin && tenant.id !== req.user.tenantId) {
      throw new ForbiddenException('You can only update your own tenant');
    }

    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  async remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Get('subdomain/:subdomain')
  @UseGuards(SuperAdminGuard)
  async findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenantsService.findBySubdomain(subdomain);
  }
}
