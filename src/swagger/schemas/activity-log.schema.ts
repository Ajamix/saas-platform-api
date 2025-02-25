export const CreateActivityLogSchema = {
  example: {
    type: 'CREATE',
    action: 'Created new user',
    details: {
      userId: '123',
      changes: { name: 'New Name' },
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    resourceType: 'User',
    resourceId: '123e4567-e89b-12d3-a456-426614174000',
    status: 'success',
  },
};

export const ActivityLogResponseSchema = {
  example: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: '2023-01-01T00:00:00Z',
    ...CreateActivityLogSchema.example,
  },
};
