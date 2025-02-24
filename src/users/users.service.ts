import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { TenantsService } from '../tenants/tenants.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly notificationsService: NotificationsService,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(createUserDto: CreateUserDto, queryRunner?: QueryRunner): Promise<User> {
    const repo = queryRunner ? queryRunner.manager.getRepository(User) : this.userRepository;
    const roleRepo = queryRunner ? queryRunner.manager.getRepository(Role) : this.roleRepository;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Find roles if roleIds provided
    let roles: Role[] = [];
    if (createUserDto.roleIds?.length) {
      roles = await roleRepo.findBy({
        id: In(createUserDto.roleIds),
        tenantId: createUserDto.tenantId
      });
    }

    const user = repo.create({
      ...createUserDto,
      password: hashedPassword,
      roles
    });
    
    const savedUser = await repo.save(user);

    // Skip notifications during transaction (they'll be sent after commit)
    if (!queryRunner && createUserDto.tenantId) {
      const tenant = await this.tenantsService.findOne(createUserDto.tenantId);
      // Notify tenant admins about new team member
      const adminUsers = await this.findByEmailAndTenant(null, tenant.id);
      const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

      for (const admin of admins) {
        await this.notificationsService.sendNotification({
          type: 'team_update',
          user: admin,
          data: {
            companyName: tenant.name,
            action: 'added',
            memberName: `${savedUser.firstName} ${savedUser.lastName}`,
            memberEmail: savedUser.email,
            teamUrl: '/team',
          },
          tenantId: tenant.id,
        });
      }
    }

    return savedUser;
  }

  async findAll(tenantId: string, options: { 
    page?: number, 
    limit?: number, 
    search?: string 
  } = {}): Promise<{ 
    data: User[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    const { 
      page = 1, 
      limit = 10, 
      search 
    } = options;

    const skip = (page - 1) * limit;
    const query = this.userRepository.createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('user.roles', 'roles')
      .skip(skip)
      .take(limit);

    if (search) {
      query.andWhere('(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)', 
        { search: `%${search}%` }
      );
    }

    const [users, total] = await query.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tenant', 'roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByEmailAndTenant(email: string | null, tenantId: string): Promise<User | User[]> {
    if (email) {
      const user = await this.userRepository.findOne({
        where: { email, tenantId,roles:{name:'Admin'} },
        relations: ['tenant', 'roles'],
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      return user;
    }

    // If no email provided, return all users for the tenant
    return this.userRepository.find({
      where: { tenantId,roles:{name:'Admin'} },
      relations: ['tenant', 'roles'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update roles if provided
    if (updateUserDto.roleIds?.length) {
      user.roles = await this.roleRepository.findBy({
        id: In(updateUserDto.roleIds),
        tenantId: user.tenantId
      });
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    if (updateUserDto.roleIds && user.tenantId) {
      const tenant = await this.tenantsService.findOne(user.tenantId);
      
      // Notify the user about their role change
      await this.notificationsService.sendNotification({
        type: 'team_update',
        user: updatedUser,
        data: {
          companyName: tenant.name,
          action: 'role_changed',
          oldRoles: user.roles.map(r => r.name),
          newRoles: updatedUser.roles.map(r => r.name),
          effectiveDate: new Date(),
        },
        tenantId: tenant.id,
      });

      // Notify tenant admins about the role change
      const adminUsers = await this.findByEmailAndTenant(null, tenant.id);
      const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

      for (const admin of admins) {
        if (admin.id !== user.id) {
          await this.notificationsService.sendNotification({
            type: 'team_update',
            user: admin,
            data: {
              companyName: tenant.name,
              action: 'role_changed',
              memberName: `${updatedUser.firstName} ${updatedUser.lastName}`,
              memberEmail: updatedUser.email,
              oldRoles: user.roles.map(r => r.name),
              newRoles: updatedUser.roles.map(r => r.name),
              teamUrl: '/team',
            },
            tenantId: tenant.id,
          });
        }
      }
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    if (user.tenantId) {
      const tenant = await this.tenantsService.findOne(user.tenantId);
      const adminUsers = await this.findByEmailAndTenant(null, tenant.id);
      const admins = Array.isArray(adminUsers) ? adminUsers : [adminUsers];

      for (const admin of admins) {
        if (admin.id !== user.id) {
          await this.notificationsService.sendNotification({
            type: 'team_update',
            user: admin,
            data: {
              companyName: tenant.name,
              action: 'removed',
              memberName: `${user.firstName} ${user.lastName}`,
              memberEmail: user.email,
              teamUrl: '/team',
            },
            tenantId: tenant.id,
          });
        }
      }
    }

    await this.userRepository.remove(user);
  }
}
