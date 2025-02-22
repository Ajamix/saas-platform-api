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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { CreateTenantSchema, TenantResponseSchema } from '../swagger/schemas/tenant.schema';
import { LogActivity } from '../common/decorators/log-activity.decorator';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@LogActivity()
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
  @LogActivity()
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    return this.tenantsService.create(createTenantDto, req.queryRunner);
  }

  @Get()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all tenants (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ 
    status: 200,
    description: 'Returns paginated list of tenants',
    schema: {
      example: {
        data: [TenantResponseSchema.example],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10
      }
    }
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.tenantsService.findAll(page, limit, search);
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

    if (!req.user.isSuperAdmin && tenant.id !== req.user.tenantId) {
      throw new ForbiddenException('You can only update your own tenant');
    }

    return this.tenantsService.update(id, updateTenantDto, req.user, req);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  async remove(@Param('id') id: string, @Request() req) {
    return this.tenantsService.remove(id, req.user, req);
  }

  @Get('subdomain/:subdomain')
  @UseGuards(SuperAdminGuard)
  async findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenantsService.findBySubdomain(subdomain);
  }
}
