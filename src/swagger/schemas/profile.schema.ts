export const CreateProfileSchema = {
  example: {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    avatar: 'https://example.com/avatar.jpg',
    phoneNumber: '+1234567890',
    dateOfBirth: '1990-01-01',
    title: 'Senior Developer',
    department: 'Engineering',
    bio: 'Full-stack developer with 5 years of experience',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe',
    },
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      language: 'en',
    },
  },
};

export const ProfileResponseSchema = {
  example: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
    ...CreateProfileSchema.example,
  },
};
