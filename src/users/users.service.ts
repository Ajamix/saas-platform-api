import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    if (createUserDto.tenantId) {
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

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['tenant', 'roles'],
    });
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
        where: { email, tenantId },
        relations: ['tenant', 'roles'],
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      return user;
    }

    // If no email provided, return all users for the tenant
    return this.userRepository.find({
      where: { tenantId },
      relations: ['tenant', 'roles'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const oldRoles = [...user.roles];

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
          oldRoles: oldRoles.map(r => r.name),
          newRoles: user.roles.map(r => r.name),
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
              oldRoles: oldRoles.map(r => r.name),
              newRoles: user.roles.map(r => r.name),
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
