export const LoginSchema = {
  example: {
    email: "user@example.com",
    password: "password123",
    subdomain: "my-tenant" // optional for tenant users
  }
};

export const LoginResponseSchema = {
  example: {
    user: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      isActive: true
    },
    accessToken: "eyJhbGciOiJIUzI1NiIs...",
    refreshToken: "eyJhbGciOiJIUzI1NiIs..."
  }
};

export const RegisterSchema = {
  example: {
    email: "admin@newcompany.com",
    password: "securePass123!",
    firstName: "Jane",
    lastName: "Smith",
    tenant: {
      tenantName: "New Company Ltd",
      subdomain: "new-company"
    }
  }
};

export const RegisterResponseSchema = {
  example: {
    user: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "admin@newcompany.com",
      firstName: "Jane",
      lastName: "Smith",
      isActive: true
    },
    tenant: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "New Company Ltd",
      subdomain: "new-company"
    },
    accessToken: "eyJhbGciOiJIUzI1NiIs...",
    refreshToken: "eyJhbGciOiJIUzI1NiIs..."
  }
}; 