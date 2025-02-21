// Admin Dashboard Types
export interface PlanStats {
  plan: string;
  count: number;
  revenue: number;
}

export interface GrowthStat {
  period: string;
  count: number;
}

export interface RevenueStat {
  period: string;
  revenue: number;
}

export interface AdminDashboardStats {
  overview: {
    totalUsers: number;
    totalTenants: number;
    activeSubscriptions: number;
    totalRevenue: number;
    activeTenantsCount: number;
    inactiveTenantsCount: number;
  };
  recentTenants: any[];
  subscriptionsByPlan: PlanStats[];
}

// Tenant Dashboard Types
export interface UserActivityStat {
  period: string;
  newUsers: number;
}

export interface RoleDistribution {
  role: string;
  userCount: number;
}

export interface TenantDashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalRoles: number;
    subscription: {
      plan: string;
      status: string;
      currentPeriodEnd: Date;
    } | null;
  };
  recentUsers: any[];
  roles: {
    name: string;
    permissionsCount: number;
    description?: string;
  }[];
} 