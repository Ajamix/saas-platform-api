import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityType } from '../activity-logs/entities/activity-log.entity';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(createTenantDto: CreateTenantDto, user: User, request?: Request): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantDto);
    const savedTenant = await this.tenantRepository.save(tenant);

    // Log the activity
    await this.activityLogsService.logUserActivity(
      user,
      'Created new tenant',
      ActivityType.CREATE,
      {
        tenantId: savedTenant.id,
        tenantName: savedTenant.name,
        subdomain: savedTenant.subdomain
      },
      request
    );

    return savedTenant;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ 
    data: Tenant[],
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
    const data = await this.tenantRepository.find({
      where: whereCondition,
      relations: ['users'],
      select: {
        id: true,
        name: true,
        subdomain: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        users: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true
        }
      },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
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
    await this.activityLogsService.logUserActivity(
      user,
      'Updated tenant',
      ActivityType.UPDATE,
      {
        tenantId: id,
        changes: {
          previous: previousValues,
          current: updateTenantDto
        }
      },
      request
    );

    return updatedTenant;
  }

  async remove(id: string, user: User, request?: Request): Promise<void> {
    const tenant = await this.findOne(id);
    const result = await this.tenantRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    // Log the activity
    await this.activityLogsService.logUserActivity(
      user,
      'Deleted tenant',
      ActivityType.DELETE,
      {
        tenantId: id,
        tenantName: tenant.name,
        subdomain: tenant.subdomain
      },
      request
    );
  }
}
