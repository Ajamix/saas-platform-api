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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({
    schema: {
      example: {
        email: "newuser@company.com",
        password: "securePass123!",
        firstName: "New",
        lastName: "User",
        isActive: true,
        tenantId: "123e4567-e89b-12d3-a456-426614174000",
        roleIds: ["123e4567-e89b-12d3-a456-426614174000"]
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "newuser@company.com",
        firstName: "New",
        lastName: "User",
        isActive: true,
        tenantId: "123e4567-e89b-12d3-a456-426614174000",
        roles: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Editor",
            description: "Can edit content"
          }
        ]
      }
    }
  })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Only super admin can create users for any tenant
    // Regular users can only create users for their own tenant
    if (!req.user.isSuperAdmin && req.user.tenantId !== createUserDto.tenantId) {
      throw new ForbiddenException('You can only create users for your own tenant');
    }

    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(SuperAdminGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('tenant')
  async findByTenant(@Request() req) {
    // Users can only see users from their own tenant
    return this.usersService.findByEmailAndTenant('', req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(id);
    
    // Users can only see users from their own tenant
    if (!req.user.isSuperAdmin && user.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('You can only view users from your own tenant');
    }

    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.findOne(id);

    // Users can only update users from their own tenant
    if (!req.user.isSuperAdmin && user.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('You can only update users from your own tenant');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(id);

    // Users can only delete users from their own tenant
    if (!req.user.isSuperAdmin && user.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('You can only delete users from your own tenant');
    }

    return this.usersService.remove(id);
  }
}
