import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { SubscriptionPlan } from '../../subscriptions/entities/subscription-plan.entity';

interface PlanStats {
  plan: string;
  count: number;
  revenue: number;
}

interface GrowthStat {
  period: string;
  count: number;
}

interface RevenueStat {
  period: string;
  revenue: number;
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalTenants,
      activeSubscriptions,
      totalRevenue,
      recentTenants,
      subscriptionsByPlan,
      activeTenantsCount,
      inactiveTenantsCount,
    ] = await Promise.all([
      // Total users count
      this.userRepository.count(),

      // Total tenants count
      this.tenantRepository.count(),

      // Active subscriptions count
      this.subscriptionRepository.count({
        where: { status: 'active' },
      }),

      // Total revenue calculation
      this.calculateTotalRevenue(),

      // Recent tenants
      this.tenantRepository.find({
        take: 5,
        order: { createdAt: 'DESC' },
        relations: ['users'],
      }),

      // Subscriptions grouped by plan
      this.getSubscriptionsByPlan(),

      // Active tenants count
      this.tenantRepository.count({
        where: { isActive: true },
      }),

      // Inactive tenants count
      this.tenantRepository.count({
        where: { isActive: false },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalTenants,
        activeSubscriptions,
        totalRevenue,
        activeTenantsCount,
        inactiveTenantsCount,
      },
      recentTenants,
      subscriptionsByPlan,
    };
  }

  private async calculateTotalRevenue(): Promise<number> {
    const allSubscriptions = await this.subscriptionRepository.find({
      relations: ['plan'],
    });

    return allSubscriptions.reduce((total, subscription) => {
      const billingCycles = calculateBillingCycles(subscription);
      console.log(billingCycles);
      return total + (subscription.priceAtCreation || 0) * billingCycles;
    }, 0);
  }

  private async getSubscriptionsByPlan(): Promise<PlanStats[]> {
    const plans = await this.subscriptionPlanRepository.find();
    const result: PlanStats[] = [];

    for (const plan of plans) {
      const count = await this.subscriptionRepository.count({
        where: {
          planId: plan.id,
          status: 'active',
        },
      });

      result.push({
        plan: plan.name,
        count,
        revenue: count * plan.price,
      });
    }

    return result;
  }

  async getTenantGrowthStats(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 30); // Last 30 days
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 12 * 7); // Last 12 weeks
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
        break;
    }

    const tenants = await this.tenantRepository
      .createQueryBuilder('tenant')
      .where('tenant.createdAt >= :startDate', { startDate })
      .andWhere('tenant.createdAt <= :endDate', { endDate: now })
      .getMany();

    return this.aggregateGrowthStats(tenants, period, startDate, now);
  }

  private aggregateGrowthStats(
    tenants: Tenant[],
    period: string,
    startDate: Date,
    endDate: Date,
  ): GrowthStat[] {
    const stats: GrowthStat[] = [];
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

      const count = tenants.filter(
        (tenant) =>
          tenant.createdAt >= periodStart && tenant.createdAt < periodEnd,
      ).length;

      stats.push({
        period: periodStart.toISOString().split('T')[0],
        count,
      });
    }

    return stats;
  }

  async getRevenueStats(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ): Promise<RevenueStat[]> {
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

    const subscriptions = await this.subscriptionRepository.find({
      where: {
        currentPeriodEnd: MoreThanOrEqual(startDate), // Ensure subscriptions that were active during the period are included
      },
      relations: ['plan'],
    });

    return this.aggregateRevenueStats(subscriptions, period);
  }

  private aggregateRevenueStats(
    subscriptions: Subscription[],
    period: string,
  ): RevenueStat[] {
    if (subscriptions.length === 0) return [];

    // ✅ Find the latest subscription created
    const latestSubscriptionDate = subscriptions.reduce((latest, sub) => {
      return sub.createdAt > latest ? sub.createdAt : latest;
    }, subscriptions[0].createdAt);

    // ✅ Set the start date as (latest - 10 periods)
    const startDate = new Date(latestSubscriptionDate);
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 10);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 10 * 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 10);
        break;
    }

    const endDate = new Date(latestSubscriptionDate);
    const stats: RevenueStat[] = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const periodStart = new Date(current);
      const periodEnd = new Date(periodStart);

      switch (period) {
        case 'daily':
          periodEnd.setDate(periodEnd.getDate() + 1);
          break;
        case 'weekly':
          periodEnd.setDate(periodEnd.getDate() + 7);
          break;
        case 'monthly':
          periodStart.setDate(1); // ✅ Ensure the month always starts on the 1st
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          periodEnd.setDate(1);
          break;
      }

      const revenue = subscriptions.reduce((total, sub) => {
        const cycleStart = new Date(sub.currentPeriodStart);

        while (cycleStart <= sub.currentPeriodEnd && cycleStart <= endDate) {
          const monthStart = new Date(
            cycleStart.getFullYear(),
            cycleStart.getMonth(),
            1,
          );
          const nextMonthStart = new Date(monthStart);
          nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

          if (cycleStart >= periodStart && cycleStart < periodEnd) {
            total += sub.priceAtCreation || 0;
          }

          cycleStart.setMonth(
            cycleStart.getMonth() + (sub.plan.interval === 'monthly' ? 1 : 12),
          );
        }

        return total;
      }, 0);

      stats.push({
        period: periodStart.toISOString().split('T')[0],
        revenue,
      });

      current = new Date(periodEnd);
    }

    return stats;
  }
}
function calculateBillingCycles(subscription: Subscription): number {
  const { currentPeriodStart, currentPeriodEnd, plan } = subscription;
  const start = new Date(currentPeriodStart);
  const end = new Date(currentPeriodEnd);

  if (plan.interval === 'monthly') {
    return (
      Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30),
      ) + 1
    );
  } else if (plan.interval === 'yearly') {
    return (
      Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365),
      ) + 1
    );
  } else {
    throw new Error('Unsupported interval type');
  }
}
