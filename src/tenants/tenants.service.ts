import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, QueryRunner } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityType } from '../activity-logs/entities/activity-log.entity';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { GlobalSetting } from '../settings/global-settings/entities/global-setting.entity';
export interface TenantWithUserCount {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalUsers: number; // ✅ Custom field for user count
}
@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GlobalSetting)
    private readonly globalSettingRepository: Repository<GlobalSetting>,
  ) {}

  async createTenantAdminRole(tenant: Tenant, queryRunner?: QueryRunner): Promise<Role> {
    const repo = queryRunner ? queryRunner.manager.getRepository(Role) : this.roleRepository;
    const permRepo = queryRunner ? queryRunner.manager.getRepository(Permission) : this.permissionRepository;

    // Get all available permissions
    const allPermissions = await permRepo.find();

    // Retrieve the defaultUserRole from GlobalSetting
    const globalSetting = await this.globalSettingRepository.findOne({ where: { isActive: true }, select: ['systemSettings'] });
    const defaultUserRole = globalSetting?.systemSettings?.defaultUserRole || 'Admin';

    // Create admin role using defaultUserRole
    const adminRole = repo.create({
      name: defaultUserRole,
      description: 'Tenant Administrator with full access',
      tenant,
      isDefault: true,
    });

    // Save the role first
    const savedRole = await repo.save(adminRole);

    // Then set the many-to-many relationships
    savedRole.permissions = allPermissions;
    
    // Save again with permissions
    return await repo.save(savedRole);
  }

  async assignAdminRole(user: User, role: Role, queryRunner?: QueryRunner): Promise<User> {
    const repo = queryRunner ? queryRunner.manager.getRepository(User) : this.userRepository;

    // Get existing user with roles
    const existingUser = await repo.findOne({
      where: { id: user.id },
      relations: ['roles'],
    });
  
    if (!existingUser) {
      throw new Error(`User with ID ${user.id} not found`);
    }
  
    existingUser.roles = existingUser.roles || [];
    if (!existingUser.roles.some((r) => r.id === role.id)) {
      existingUser.roles.push(role);
    }
  
    return await repo.save(existingUser);
  }
  

  async create(createTenantDto: CreateTenantDto, queryRunner?: QueryRunner): Promise<Tenant> {
    const repo = queryRunner ? queryRunner.manager.getRepository(Tenant) : this.tenantRepository;
    
    const tenant = repo.create(createTenantDto);
    return await repo.save(tenant);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ 
    data: TenantWithUserCount[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    const skip = (page - 1) * limit;
  
    // Build where condition for search
    const whereCondition: FindOptionsWhere<Tenant> = {};
    if (search) {
      whereCondition.name = Like(`%${search}%`);
    }
  
    // Get total count
    const total = await this.tenantRepository.count({
      where: whereCondition,
    });
  
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
  
    // Fetch paginated data
    const data = await this.tenantRepository
      .createQueryBuilder("tenant")
      .leftJoin("tenant.users", "user") // ✅ We do NOT select user.id anymore
      .select([
        "tenant.id",
        "tenant.name",
        "tenant.subdomain",
        "tenant.isActive",
        "tenant.createdAt",
        "tenant.updatedAt"
      ])
      .addSelect("COUNT(user.id)", "totalUsers") // ✅ Get total users directly from the DB
      .groupBy("tenant.id") // ✅ Group by tenant ID to aggregate correctly
      .skip(skip)
      .take(limit)
      .orderBy("tenant.createdAt", "DESC")
      .getRawMany(); // ✅ Fetch as raw data to include the count
  
    return {
      data: data.map(tenant => ({
        id: tenant.tenant_id,
        name: tenant.tenant_name,
        subdomain: tenant.tenant_subdomain,
        isActive: tenant.tenant_isActive,
        createdAt: tenant.tenant_createdAt,
        updatedAt: tenant.tenant_updatedAt,
        totalUsers: Number(tenant.totalUsers), // ✅ Convert totalUsers to a number
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }
  

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain "${subdomain}" not found`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto, user: User, request?: Request): Promise<Tenant> {
    const tenant = await this.findOne(id);
    const previousValues = { ...tenant };
    Object.assign(tenant, updateTenantDto);
    const updatedTenant = await this.tenantRepository.save(tenant);

    // Log the activity


    return updatedTenant;
  }

  async remove(id: string, user: User, request?: Request): Promise<void> {
    const tenant = await this.findOne(id);
    const result = await this.tenantRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }


  }

  async getAllowUserRegistration(): Promise<boolean> {
    const globalSetting = await this.globalSettingRepository.findOne({ where: { isActive: true }, select: ['systemSettings'] });
    return globalSetting?.systemSettings?.allowUserRegistration ?? false;
  }
}
