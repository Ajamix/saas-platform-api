export const CreateTenantSchema = {
  example: {
    name: 'New Company Ltd',
    subdomain: 'new-company',
    isActive: true,
    settings: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      features: ['chat', 'notifications'],
    },
  },
};

export const TenantResponseSchema = {
  example: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'New Company Ltd',
    subdomain: 'new-company',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    settings: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      features: ['chat', 'notifications'],
    },
  },
};
