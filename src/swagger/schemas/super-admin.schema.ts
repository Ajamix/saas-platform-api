export const CreateSuperAdminSchema = {
  example: {
    email: "superadmin@system.com",
    password: "superSecurePass123!",
    firstName: "Super",
    lastName: "Admin",
    permissions: ["all", "manage_tenants", "manage_subscriptions"]
  }
};

export const SuperAdminResponseSchema = {
  example: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "superadmin@system.com",
    firstName: "Super",
    lastName: "Admin",
    isActive: true,
    permissions: ["all", "manage_tenants", "manage_subscriptions"]
  }
};

export const CreateSubscriptionPlanSchema = {
  example: {
    name: "Professional Plan",
    description: "Perfect for growing businesses",
    price: 29.99,
    interval: "monthly",
    features: [
      "Up to 10 users",
      "24/7 support",
      "Custom domain",
      "API access"
    ],
    isActive: true
  }
}; 