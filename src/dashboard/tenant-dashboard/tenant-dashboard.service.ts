import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Role } from '../../roles/entities/role.entity';

interface UserActivityStat {
  period: string;
  newUsers: number;
}

interface RoleDistribution {
  role: string;
  userCount: number;
}

@Injectable()
export class TenantDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getTenantDashboardStats(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['users'],
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        users: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          firstName: true,
          lastName: true,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const [totalUsers, activeUsers, currentSubscription, roles, recentUsers] =
      await Promise.all([
        // Total users count
        this.userRepository.count({
          where: { tenantId },
        }),

        // Active users count
        this.userRepository.count({
          where: { tenantId, isActive: true },
        }),

        // Current subscription
        this.subscriptionRepository.findOne({
          where: { tenantId, status: 'active' },
          relations: ['plan'],
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            plan: {
              id: true,
              name: true,
            },
          },
        }),

        // Roles count
        this.roleRepository.find({
          where: { tenant: { id: tenantId } },
          relations: ['permissions'],
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              id: true,
              name: true,
            },
          },
        }),

        // Recent users
        this.userRepository.find({
          where: { tenantId },
          take: 5,
          order: { createdAt: 'DESC' },
          relations: ['roles'],
          select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            firstName: true,
            lastName: true,
            roles: {
              id: true,
              name: true,
            },
          },
        }),
      ]);

    return {
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalRoles: roles.length,
        subscription: currentSubscription
          ? {
              plan: currentSubscription.plan.name,
              status: currentSubscription.status,
              currentPeriodEnd: currentSubscription.currentPeriodEnd,
            }
          : null,
      },
      recentUsers,
      roles: roles.map((role) => ({
        name: role.name,
        permissionsCount: role.permissions.length,
        description: role.description,
      })),
    };
  }

  async getUserActivityStats(
    tenantId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 12 * 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere('user.createdAt >= :startDate', { startDate })
      .andWhere('user.createdAt <= :endDate', { endDate: now })
      .getMany();

    return this.aggregateUserStats(users, period, startDate, now);
  }

  private aggregateUserStats(
    users: User[],
    period: string,
    startDate: Date,
    endDate: Date,
  ): UserActivityStat[] {
    const stats: UserActivityStat[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const periodStart = new Date(current);
      let periodEnd: Date;

      switch (period) {
        case 'daily':
          periodEnd = new Date(current.setDate(current.getDate() + 1));
          break;
        case 'weekly':
          periodEnd = new Date(current.setDate(current.getDate() + 7));
          break;
        case 'monthly':
          periodEnd = new Date(current.setMonth(current.getMonth() + 1));
          break;
      }

      const count = users.filter(
        (user) => user.createdAt >= periodStart && user.createdAt < periodEnd,
      ).length;

      stats.push({
        period: periodStart.toISOString().split('T')[0],
        newUsers: count,
      });
    }

    return stats;
  }

  async getRoleDistribution(tenantId: string): Promise<RoleDistribution[]> {
    const roles = await this.roleRepository.find({
      where: { tenant: { id: tenantId } },
      relations: ['users'],
    });

    return roles.map((role) => ({
      role: role.name,
      userCount: role.users.length,
    }));
  }
}
