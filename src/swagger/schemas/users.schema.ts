export const CreateUserSchema = {
  example: {
    email: 'newuser@company.com',
    password: 'securePass123!',
    firstName: 'New',
    lastName: 'User',
    isActive: true,
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    roleIds: ['123e4567-e89b-12d3-a456-426614174000'],
  },
};

export const UserResponseSchema = {
  example: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'newuser@company.com',
    firstName: 'New',
    lastName: 'User',
    isActive: true,
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    roles: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Editor',
        description: 'Can edit content',
      },
    ],
  },
};
