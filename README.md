# Multi-Tenant SaaS Platform API

A robust and scalable SaaS platform backend built with NestJS, featuring multi-tenancy, authentication, role-based access control, and real-time notifications.

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## 🚀 Features

- **Multi-tenancy**
  - Isolated tenant environments
  - Custom domain support
  - Tenant-specific configurations
  - Resource isolation

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (RBAC)
  - Permission management
  - Super admin capabilities

- **User Management**
  - User profiles
  - Role assignment
  - Activity tracking
  - Password policies

- **Settings Management**
  - Global system settings
  - Tenant-specific settings
  - SMTP configuration
  - Branding customization

- **Real-time Features**
  - WebSocket notifications
  - Activity monitoring
  - Live dashboard updates
  - Real-time chat (optional)

- **Subscription & Billing**
  - Subscription plans
  - Usage tracking
  - Payment integration
  - Billing management

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Queue**: Bull
- **WebSockets**: Socket.io
- **Documentation**: Swagger/OpenAPI
- **Authentication**: JWT
- **Testing**: Jest

## 📋 Prerequisites

```bash
Node.js (v16+)
PostgreSQL (v13+)
Redis (v6+)
```

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd saas-platform-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm run start:dev
```

5. **Access the API documentation**
```
http://localhost:3000/api/docs
```

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=saas_platform

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

## 📚 API Documentation

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New tenant registration
- `POST /api/auth/refresh` - Refresh access token

#### Users
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `PATCH /api/users/:id` - Update user

#### Tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants` - List tenants
- `PATCH /api/tenants/:id` - Update tenant

#### Settings
- `POST /api/global-settings` - Create global settings
- `GET /api/global-settings` - Get global settings
- `PATCH /api/tenant-settings` - Update tenant settings

#### Subscriptions
- `POST /api/subscriptions/plans` - Create subscription plan
- `GET /api/subscriptions/plans` - List subscription plans
- `POST /api/subscriptions/subscribe` - Subscribe to plan

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── tenants/        # Multi-tenancy handling
├── settings/       # Global & tenant settings
├── subscriptions/  # Subscription management
├── notifications/  # Real-time notifications
├── profiles/       # User profiles
├── dashboard/      # Analytics dashboards
├── activity-logs/  # System activity tracking
├── websocket/      # WebSocket handlers
└── config/         # Configuration files
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please check:
- [Documentation](docs/)
- [Issue Tracker](issues/)
- Email: support@example.com

## 🔄 CI/CD

The project uses GitHub Actions for continuous integration and deployment. Check `.github/workflows` for the pipeline configuration.
