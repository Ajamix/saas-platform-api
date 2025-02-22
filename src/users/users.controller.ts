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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { DynamicPermissionsGuard } from '../permissions/guards/dynamic-permissions.guard';
import { ControllerPermissions } from '../permissions/decorators/controller-permissions.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, DynamicPermissionsGuard)
@ControllerPermissions('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user in tenant' })
  @ApiResponse({ status: 201, type: User })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const { tenantId, ...userData } = createUserDto;
    
    return this.usersService.create({
      ...userData,
      tenantId: req.user.tenantId
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all users in tenant (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ 
    status: 200,
    description: 'Returns paginated list of users',
    schema: {
      example: {
        data: [User],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10
      }
    }
  })
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(req.user.tenantId, {
      page,
      limit,
      search
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: User })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: User })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
