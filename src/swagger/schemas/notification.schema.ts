export const CreateNotificationSchema = {
  example: {
    type: 'SYSTEM',
    title: 'System Update',
    message: 'System will be under maintenance in 1 hour',
    priority: 'high',
    recipientId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    metadata: {
      actionUrl: '/settings/maintenance',
      icon: 'warning',
    },
  },
};

export const NotificationResponseSchema = {
  example: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: '2023-01-01T00:00:00Z',
    read: false,
    readAt: null,
    ...CreateNotificationSchema.example,
  },
};
